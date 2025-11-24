import FullLogo from '@/components/FullLogo';
import Florest from '@/components/illustration/florest';
import AuthLogin from '@/components/login/authform/AuthLogin';
const gradientStyle = {
  background:
    'linear-gradient(45deg, rgb(238, 119, 82,0.2), rgb(231, 60, 126,0.2), rgb(35, 166, 213,0.2), rgb(35, 213, 171,0.2))',
  backgroundSize: '400% 400%',
  animation: 'gradient 2s ease infinite',
  height: '100vh',
};

const Login = () => {
  return (
    <>
      <div className="hidden h-screen w-full sm:hidden md:flex">
        <div className="bg-primary align-center flex w-[30%] flex-col justify-center p-4">
          <div className="bg-primary align-center flex w-full flex-col justify-center p-4">
            <div className="mx-auto h-38 w-48">
              <FullLogo withoutLink />
            </div>
            <AuthLogin />
            <div className="text-ld mt-6 flex flex-col items-center justify-center gap-2 text-base font-medium">
              <p>New to AccountFlow?</p>
              <a
                href="/auth/register"
                className="text-secondary hover:text-secondary-hover active:text-secondary-hover text-sm font-medium"
              >
                Create an account
              </a>
            </div>
          </div>
        </div>
        <div className="aling-center bg-text flex h-screen w-[70%] justify-center">
          <div className="aling-center flex h-screen w-[50%] justify-center">
            <Florest />
          </div>
        </div>
      </div>
      <div style={gradientStyle} className="text-dark relative flex h-screen w-full overflow-hidden sm:flex md:hidden">
        <div className="flex h-full w-full items-center justify-center px-4">
          <div className="bg-primary dark:bg-primary w-full rounded-xl border-none p-6 shadow-md md:w-96">
            <div className="flex w-full flex-col gap-2 p-0">
              <div className="mx-auto h-38 w-48">
                <FullLogo withoutLink />
              </div>
              <AuthLogin />
              <div className="text-ld mt-6 flex flex-col items-center justify-center gap-2 text-base font-medium">
                <p>New to AccountFlow?</p>
                <a
                  href="/auth/register"
                  className="text-secondary hover:text-secondary-hover active:text-secondary-hover text-sm font-medium"
                >
                  Create an account
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
