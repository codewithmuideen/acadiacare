import { cn } from '../../lib/cn'

export default function Container({ as: Tag = 'div', className, children, ...rest }) {
  return (
    <Tag className={cn('container-site', className)} {...rest}>
      {children}
    </Tag>
  )
}
