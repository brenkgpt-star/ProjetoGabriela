import BoletimProvider from '@contexts/BoletimProvider'
import AppRoutes from './routes/AppRoutes'

export default function App() {
  return (
    <BoletimProvider>
      <AppRoutes />
    </BoletimProvider>
  )
}
