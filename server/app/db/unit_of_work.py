from sqlalchemy.orm import Session

from app.db.database import SessionLocal


class UnitOfWork:
    """Lightweight Unit of Work wrapping a SQLAlchemy session."""

    def __init__(self, session_factory=SessionLocal):
        self._session_factory = session_factory
        self.session: Session | None = None

    def __enter__(self) -> "UnitOfWork":
        self.session = self._session_factory()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        if exc_type:
            self.rollback()
        self.close()

    def commit(self) -> None:
        self.session.commit()

    def rollback(self) -> None:
        self.session.rollback()

    def close(self) -> None:
        if self.session:
            self.session.close()
            self.session = None
