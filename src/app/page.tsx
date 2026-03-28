import AuthForm from '@/components/AuthForm'

export const metadata = {
  title: 'Sign In — FuelSpotter NG',
}

export default function LoginPage() {
  return (
    <div className="py-10">
      <AuthForm type="login" />
    </div>
  )
}
