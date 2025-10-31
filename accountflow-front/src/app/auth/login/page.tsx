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
      <div className="sm:hidden md:flex h-screen w-full hidden">
        <div className="w-[30%] bg-primary flex align-center justify-center flex-col p-4">
          <div className="w-full bg-primary flex align-center  justify-center flex-col p-4">
            <div className="mx-auto w-48 h-38">
              <FullLogo withoutLink />
            </div>
            <AuthLogin />
            <div className="flex gap-2 text-base text-ld font-medium mt-6 items-center justify-center flex-col">
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
        <div className="w-[70%] flex aling-center justify-center h-screen bg-text">
          <div className="w-[50%] flex aling-center justify-center h-screen">
            <Florest />
          </div>
        </div>
      </div>
      <div style={gradientStyle} className="relative overflow-hidden h-screen text-dark sm:flex md:hidden flex w-full">
        <div className="flex h-full justify-center items-center px-4 w-full">
          <div className="rounded-xl shadow-md bg-primary dark:bg-primary p-6 w-full md:w-96 border-none">
            <div className="flex flex-col gap-2 p-0 w-full">
              <div className="mx-auto w-48 h-38">
                <FullLogo withoutLink />
              </div>
              <AuthLogin />
              <div className="flex gap-2 text-base text-ld font-medium mt-6 items-center justify-center flex-col">
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
