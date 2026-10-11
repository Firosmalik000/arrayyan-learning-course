import AuthLogin from '@/Pages/Auth/Login';

export default function AdminLogin(props) {
    return <AuthLogin {...props} context="admin" />;
}

AdminLogin.layout = AuthLogin.layout;
