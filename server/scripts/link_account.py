"""One-time script to link a bank account via Plaid Link.

Starts a temporary local server, opens Plaid Link in your browser,
and saves the access token + account to the database.

Usage: uv run python -m scripts.link_account
"""

import threading
import webbrowser
from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import urllib.parse

from app.clients.plaid import PlaidClient
from app.db.database import SessionLocal
from app.db.models.account import Account
from app.db.models.enums import AccountType
from app.db.models.plaid_item import PlaidItem

PORT = 9876
plaid_client = PlaidClient()

ACCOUNT_TYPE_MAP = {
    "checking": AccountType.checking,
    "savings": AccountType.savings,
    "credit": AccountType.credit_card,
    "investment": AccountType.investment,
}

LINK_HTML = """<!DOCTYPE html>
<html>
<head><title>Link Account</title></head>
<body>
<script src="https://cdn.plaid.com/link/v2/stable/link-initialize.js"></script>
<script>
const handler = Plaid.create({
  token: '%s',
  onSuccess: (public_token, metadata) => {
    const account = metadata.accounts[0];
    const params = new URLSearchParams({
      public_token: public_token,
      account_name: metadata.institution.name + ' - ' + account.name,
      account_type: account.subtype || account.type,
    });
    fetch('/callback?' + params.toString(), { method: 'POST' })
      .then(() => { document.body.innerHTML = '<h2>Account linked! You can close this tab.</h2>'; });
  },
  onExit: (err) => {
    document.body.innerHTML = '<h2>Cancelled. You can close this tab.</h2>';
  },
});
handler.open();
</script>
</body>
</html>"""


class LinkHandler(BaseHTTPRequestHandler):
    link_token = None

    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-Type", "text/html")
        self.end_headers()
        self.wfile.write((LINK_HTML % self.link_token).encode())

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        params = urllib.parse.parse_qs(parsed.query)

        public_token = params["public_token"][0]
        account_name = params["account_name"][0]
        account_type = params["account_type"][0]

        result = plaid_client.exchange_public_token(public_token)

        db = SessionLocal()
        try:
            mapped_type = ACCOUNT_TYPE_MAP.get(account_type, AccountType.checking)
            account = Account(name=account_name, type=mapped_type)
            db.add(account)
            db.flush()

            plaid_item = PlaidItem(
                item_id=result["item_id"],
                access_token=result["access_token"],
                account_id=account.id,
            )
            db.add(plaid_item)
            db.commit()

            print(f"\n+ Linked: {account_name} ({account_type})")
            print(f"  Account ID: {account.id}")
            print(f"  Plaid Item ID: {plaid_item.id}")
        finally:
            db.close()

        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps({"status": "ok"}).encode())

        threading.Thread(target=self.server.shutdown).start()

    def log_message(self, format, *args):
        pass


def main():
    link_token = plaid_client.create_link_token("personal")
    LinkHandler.link_token = link_token

    server = HTTPServer(("localhost", PORT), LinkHandler)
    print(f"Opening Plaid Link at http://localhost:{PORT}")
    webbrowser.open(f"http://localhost:{PORT}")
    server.serve_forever()
    print("Done.")


if __name__ == "__main__":
    main()
