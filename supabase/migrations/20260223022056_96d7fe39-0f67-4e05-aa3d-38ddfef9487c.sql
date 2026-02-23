
-- Templates de documentos
CREATE TABLE public.document_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'peticao',
  description TEXT,
  content TEXT NOT NULL DEFAULT '',
  variables TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "document_templates readable" ON public.document_templates FOR SELECT USING (true);
CREATE POLICY "document_templates insertable" ON public.document_templates FOR INSERT WITH CHECK (true);
CREATE POLICY "document_templates updatable" ON public.document_templates FOR UPDATE USING (true);
CREATE POLICY "document_templates deletable" ON public.document_templates FOR DELETE USING (true);

CREATE TRIGGER update_document_templates_updated_at
  BEFORE UPDATE ON public.document_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Documentos gerados (vinculados a processos)
CREATE TABLE public.generated_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.document_templates(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT 'template',
  version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.generated_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "generated_documents readable" ON public.generated_documents FOR SELECT USING (true);
CREATE POLICY "generated_documents insertable" ON public.generated_documents FOR INSERT WITH CHECK (true);
CREATE POLICY "generated_documents updatable" ON public.generated_documents FOR UPDATE USING (true);
CREATE POLICY "generated_documents deletable" ON public.generated_documents FOR DELETE USING (true);

CREATE TRIGGER update_generated_documents_updated_at
  BEFORE UPDATE ON public.generated_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Versionamento de documentos
CREATE TABLE public.document_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.generated_documents(id) ON DELETE CASCADE,
  version INT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  changed_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "document_versions readable" ON public.document_versions FOR SELECT USING (true);
CREATE POLICY "document_versions insertable" ON public.document_versions FOR INSERT WITH CHECK (true);
