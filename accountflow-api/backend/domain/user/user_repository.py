from typing import Protocol
from backend.domain.user.user_models import User


class IUserRepository(Protocol):
    """
    Interface de repositório para o agregado User.
    """

    def exists_by_email(self, email: str) -> bool: ...
    def save(self, user: User) -> User: ...
