import { ButtonHTMLAttributes } from 'react';

export default function TextButton({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`text-button ${className}`} {...props} />;
}
