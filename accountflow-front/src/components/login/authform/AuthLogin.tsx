'use client';
import { Button, Checkbox, Label, FloatingLabel, TextInput } from 'flowbite-react';

const AuthLogin = () => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log(event);
  };
  return (
    <>
      <form onSubmit={handleSubmit} className="text-black">
        <FloatingLabel
          variant="standard"
          label="Username"
          placeholder="Username"
          id="Username"
          type="text"
          sizing="md"
          required
          className="form-control form-rounded-xl"
        />
        <FloatingLabel
          variant="standard"
          label="Password"
          placeholder="Password"
          id="userpwd"
          type="password"
          sizing="md"
          required
          className="form-control form-rounded-xl"
        />

        <div className="flex gap-2 my-5 flex-col">
          <div className="flex items-center gap-2">
            <Checkbox id="accept" className="checkbox" />
            <Label htmlFor="accept" className="opacity-90 font-normal cursor-pointer">
              Remember this Device
            </Label>
          </div>
          <a
            href={'/'}
            className="text-secondary hover:text-secondary-hover active:text-secondary-hover text-sm font-medium"
          >
            Forgot Password ?
          </a>
        </div>
        <Button
          type="submit"
          color={'primary'}
          className="w-full bg-secondary hover:bg-secondary-hover active:bg-secondary-hover text-white rounded-xl"
        >
          Sign in
        </Button>
      </form>
    </>
  );
};

export default AuthLogin;
