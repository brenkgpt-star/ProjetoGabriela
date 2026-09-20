import { Routes, Route } from 'react-router-dom'
import AppLayout from '@components/layout/AppLayout'
import Inicio from '@pages/Inicio'
import Painel from '@pages/Painel'
import Comecar from '@pages/Comecar'
import Alunos from '@pages/Alunos'
import Turmas from '@pages/Turmas'
import Boletins from '@pages/Boletins'
import NovoBoletim from '@pages/Boletins/NovoBoletim'
import LeituraNotas from '@pages/LeituraNotas'
import VisualizarBoletim from '@pages/Boletins/VisualizarBoletim'
import Provas from '@pages/Provas'
import NovaProva from '@pages/Provas/NovaProva'
import VisualizarProva from '@pages/Provas/VisualizarProva'
import Configuracoes from '@pages/Configuracoes'
import NaoEncontrado from '@pages/NaoEncontrado'
import { CAMINHOS } from './caminhos'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path={CAMINHOS.inicio} element={<Inicio />} />
        <Route path={CAMINHOS.painel} element={<Painel />} />
        <Route path={CAMINHOS.comecar} element={<Comecar />} />
        <Route path={CAMINHOS.alunos} element={<Alunos />} />
        <Route path={CAMINHOS.turmas} element={<Turmas />} />
        <Route path={CAMINHOS.boletins} element={<Boletins />} />
        <Route path={CAMINHOS.novoBoletim} element={<NovoBoletim />} />
        <Route path={CAMINHOS.lerBoletim} element={<LeituraNotas />} />
        <Route path={CAMINHOS.boletim()} element={<VisualizarBoletim />} />
        <Route path={CAMINHOS.provas} element={<Provas />} />
        <Route path={CAMINHOS.novaProva} element={<NovaProva />} />
        <Route path={CAMINHOS.prova()} element={<VisualizarProva />} />
        <Route path={CAMINHOS.configuracoes} element={<Configuracoes />} />
        <Route path="*" element={<NaoEncontrado />} />
      </Route>
    </Routes>
  )
}
