

function PageContainer({children}: {children: React.ReactNode}) {
  return (
    <div className='w-full p-4 3xl:px-32  overflow-x-clip max-w-360 mx-auto'><div className="w-full">{children}</div></div>
  )
}

export default PageContainer