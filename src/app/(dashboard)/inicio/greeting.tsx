'use client'

export function Greeting({ nombre }: { nombre: string }) {
  const hora = new Date().getHours()
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches'
  const fecha = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <header>
      <h2 className="t-h1">{saludo}, {nombre}.</h2>
      <p className="text-sm text-muted-foreground mt-1 capitalize">{fecha}</p>
    </header>
  )
}
