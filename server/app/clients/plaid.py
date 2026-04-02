import plaid
from plaid.api import plaid_api
from plaid.model.country_code import CountryCode
from plaid.model.link_token_create_request import LinkTokenCreateRequest
from plaid.model.link_token_create_request_user import LinkTokenCreateRequestUser
from plaid.model.item_public_token_exchange_request import ItemPublicTokenExchangeRequest
from plaid.model.products import Products
from plaid.model.transactions_sync_request import TransactionsSyncRequest

from app.config import PLAID_CLIENT_ID, PLAID_SECRET, PLAID_ENV

PLAID_ENV_URLS = {
    "sandbox": plaid.Environment.Sandbox,
    "development": plaid.Environment.Development,
    "production": plaid.Environment.Production,
}


class PlaidClient:
    def __init__(self):
        configuration = plaid.Configuration(
            host=PLAID_ENV_URLS.get(PLAID_ENV, plaid.Environment.Sandbox),
            api_key={
                "clientId": PLAID_CLIENT_ID,
                "secret": PLAID_SECRET,
            },
        )
        api_client = plaid.ApiClient(configuration)
        self.client = plaid_api.PlaidApi(api_client)

    def create_link_token(self, user_id: str) -> str:
        request = LinkTokenCreateRequest(
            products=[Products("transactions")],
            client_name="Personal Finance",
            country_codes=[CountryCode("US")],
            language="en",
            user=LinkTokenCreateRequestUser(client_user_id=user_id),
        )
        response = self.client.link_token_create(request)
        return response.link_token

    def exchange_public_token(self, public_token: str) -> dict:
        request = ItemPublicTokenExchangeRequest(public_token=public_token)
        response = self.client.item_public_token_exchange(request)
        return {
            "access_token": response.access_token,
            "item_id": response.item_id,
        }

    def sync_transactions(self, access_token: str, cursor: str | None = None) -> dict:
        request = TransactionsSyncRequest(
            access_token=access_token,
            cursor=cursor or "",
        )
        response = self.client.transactions_sync(request)
        return {
            "added": response.added,
            "modified": response.modified,
            "removed": response.removed,
            "next_cursor": response.next_cursor,
            "has_more": response.has_more,
        }
