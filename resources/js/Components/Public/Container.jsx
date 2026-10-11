export default function Container({ children, className = '', size = 'default' }) {
    const sizeClasses = {
        sm: 'max-w-4xl 2xl:max-w-5xl',
        default: 'max-w-7xl 2xl:max-w-[92rem]',
        lg: 'max-w-[88rem] 2xl:max-w-[100rem]',
        full: 'max-w-full',
    };

    return (
        <div className={`mx-auto w-full px-3.5 xs:px-4 sm:px-6 lg:px-8 2xl:px-10 ${sizeClasses[size] || sizeClasses.default} ${className}`}>
            {children}
        </div>
    );
}
