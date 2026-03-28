import AuthForm from '@/components/AuthForm'

export const metadata = {
  title: 'Sign Up — FuelSpotter NG',
}

export default function SignupPage() {
  return (
    <div className="py-10">
      <AuthForm type="signup" />
    </div>
  )
}
