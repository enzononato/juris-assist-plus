import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function NovaTarefa() {
  return (
    <div className="mx-auto max-w-lg p-4 md:p-6 lg:p-8">
      <Button variant="ghost" size="sm" asChild className="mb-4 gap-1 text-muted-foreground">
        <Link to="/tarefas"><ArrowLeft className="h-4 w-4" /> Voltar</Link>
      </Button>

      <h1 className="mb-6 text-xl font-bold">Criar nova tarefa</h1>

      <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-2">
          <Label>Processo ou caso *</Label>
          <Input placeholder="Buscar por nome do colaborador ou nº do processo" />
        </div>

        <div className="space-y-2">
          <Label>Adicionar responsáveis *</Label>
          <Input placeholder="Buscar usuário..." />
        </div>

        <div className="space-y-2">
          <Label>Tarefa *</Label>
          <Textarea placeholder="O que essa pessoa irá fazer?" rows={3} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Data *</Label>
            <Input type="date" />
          </div>
          <div className="space-y-2">
            <Label>Hora *</Label>
            <Input type="time" />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Prioridade</Label>
          <Select defaultValue="media">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="baixa">Baixa</SelectItem>
              <SelectItem value="media">Média</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
              <SelectItem value="critica">Crítica</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Checkbox id="cal" defaultChecked />
            <Label htmlFor="cal" className="text-sm font-normal">Mostrar na agenda</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="end" />
            <Label htmlFor="end" className="text-sm font-normal">Informar término</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="allday" />
            <Label htmlFor="allday" className="text-sm font-normal">Dia inteiro</Label>
          </div>
        </div>

        <Button type="submit" className="w-full">Criar Tarefa</Button>
      </form>
    </div>
  );
}
