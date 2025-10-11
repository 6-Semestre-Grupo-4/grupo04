from backend.domain.user.user_models import User

class FakeUserRepository:
    """
    Implementação fake do IUserRepository.
    """

    def __init__(self):
        self._users = []

    def exists_by_email(self, email: str) -> bool:
        return any(u.email == email for u in self._users)

    def save(self, user: User) -> User:
        self._users.append(user)
        return user
