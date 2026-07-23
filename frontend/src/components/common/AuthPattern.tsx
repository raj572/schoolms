

const AuthPattern =() => {
  return (
    <div className="hidden lg:flex items-center justify-center bg-background p-12">
        <div className="max-w-sm text-center">
            <div className="grid grid-cols-3 gap-3">
                {[...Array(9)].map((_, i)=>(
                    <div key={i}
                    className={`size-28 rounded-xl bg-primary ${i % 2 === 0 ? "animate-pulse": ""}`}/>
                ))}
            </div>
        </div>
    </div>
  )
}

export default AuthPattern