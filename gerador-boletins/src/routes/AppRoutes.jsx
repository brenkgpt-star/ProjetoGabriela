import { Routes, Route } from 'react-router-dom'
import AppLayout from '@components/layout/AppLayout'
import Painel from '@pages/Painel'
import Comecar from '@pages/Comecar'
import Alunos from '@pages/Alunos'
import Turmas from '@pages/Turmas'
import Boletins from '@pages/Boletins'
import NovoBoletim from '@pages/Boletins/NovoBoletim'
import LeituraNotas from '@pages/LeituraNotas'
import VisualizarBoletim from '@pages/Boletins/VisualizarBoletim'
import Configuracoes from '@pages/Configuracoes'
import NaoEncontrado from '@pages/NaoEncontrado'
import { CAMINHOS } from './caminhos'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path={CAMINHOS.painel} element={<Painel />} />
        <Route path={CAMINHOS.comecar} element={<Comecar />} />
        <Route path={CAMINHOS.alunos} element={<Alunos />} />
        <Route path={CAMINHOS.turmas} element={<Turmas />} />
        <Route path={CAMINHOS.boletins} element={<Boletins />} />
        <Route path={CAMINHOS.novoBoletim} element={<NovoBoletim />} />
        <Route path={CAMINHOS.lerBoletim} element={<LeituraNotas />} />
        <Route path={CAMINHOS.boletim()} element={<VisualizarBoletim />} />
        <Route path={CAMINHOS.configuracoes} element={<Configuracoes />} />
        <Route path="*" element={<NaoEncontrado />} />
      </Route>
    </Routes>
  )
}
