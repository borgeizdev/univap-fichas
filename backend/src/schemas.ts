import { z, ZodSchema } from 'zod';
import { Response } from 'express';

/* ── Helper ──────────────────────────────────────────────────────────────── */
export function validate<T>(schema: ZodSchema<T>, data: unknown, res: Response): T | null {
  const result = schema.safeParse(data);
  if (!result.success) {
    const msg = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(' | ');
    res.status(400).json({ error: msg });
    return null;
  }
  return result.data;
}

/* ── Shared ──────────────────────────────────────────────────────────────── */
const CURSOS = ['Informática', 'Eletrônica'] as const;
const ANOS   = ['1º ano', '2º ano', '3º ano'] as const;
const TURMAS = ['A', 'F', 'H', 'I', 'J'] as const;

const IntegranteSchema = z.object({
  nome:      z.string().min(1).max(120).trim(),
  matricula: z.string().min(1).max(30).trim(),
  lider:     z.boolean().optional(),
});

const IntegranteAvalSchema = z.object({
  nome:      z.string().min(1).max(120).trim(),
  matricula: z.string().min(1).max(30).trim(),
  nota:      z.number().min(0).max(10).nullable().optional(),
  obs:       z.string().max(500).optional().default(''),
});

/* ── Auth ────────────────────────────────────────────────────────────────── */
export const LoginSchema = z.object({
  email: z.string().email().max(255).toLowerCase().trim(),
  senha: z.string().min(1).max(128),
});

/* ── Grupos ──────────────────────────────────────────────────────────────── */
export const GrupoCreateSchema = z.object({
  id:           z.string().uuid(),
  nome:         z.string().min(1).max(120).trim(),
  curso:        z.enum(CURSOS),
  ano:          z.enum(ANOS),
  turma:        z.enum(TURMAS),
  materia:      z.string().max(120).trim().optional(),
  criadorEmail: z.string().email().max(255),
  integrantes:  z.array(IntegranteSchema).optional().default([]),
});

export const GrupoUpdateSchema = z.object({
  nome:        z.string().min(1).max(120).trim(),
  curso:       z.enum(CURSOS),
  ano:         z.enum(ANOS),
  turma:       z.enum(TURMAS),
  materia:     z.string().max(120).trim().optional(),
  integrantes: z.array(IntegranteSchema).optional().default([]),
});

/* ── Disciplinas ─────────────────────────────────────────────────────────── */
export const DisciplinaSchema = z.object({
  nome:  z.string().min(1).max(120).trim(),
  curso: z.enum(CURSOS),
});

/* ── Avaliações ──────────────────────────────────────────────────────────── */
export const AvaliacaoCreateSchema = z.object({
  id:              z.string().uuid(),
  grupoNome:       z.string().min(1).max(120).trim(),
  criadorEmail:    z.string().email().max(255).optional(),
  professorEmail:  z.string().email().max(255),
  professorNome:   z.string().min(1).max(120).trim(),
  disciplina:      z.string().min(1).max(120).trim(),
  nota:            z.number().min(0).max(10).nullable().optional(),
  anotacoes:       z.string().max(2000).optional().default(''),
  positivos:       z.string().max(2000).optional().default(''),
  melhorar:        z.string().max(2000).optional().default(''),
  integrantesAval: z.array(IntegranteAvalSchema).optional().default([]),
  data:            z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'data deve estar no formato YYYY-MM-DD'),
  status:          z.string().max(30).optional().default('Publicada'),
});

export const AvaliacaoUpdateSchema = z.object({
  grupoNome:       z.string().min(1).max(120).trim(),
  criadorEmail:    z.string().email().max(255).optional(),
  professorEmail:  z.string().email().max(255),
  professorNome:   z.string().min(1).max(120).trim(),
  disciplina:      z.string().min(1).max(120).trim(),
  nota:            z.number().min(0).max(10).nullable().optional(),
  anotacoes:       z.string().max(2000).optional().default(''),
  positivos:       z.string().max(2000).optional().default(''),
  melhorar:        z.string().max(2000).optional().default(''),
  integrantesAval: z.array(IntegranteAvalSchema).optional().default([]),
  data:            z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'data deve estar no formato YYYY-MM-DD'),
  status:          z.string().max(30).optional().default('Publicada'),
});

/* ── Professores ─────────────────────────────────────────────────────────── */
export const ProfessorCreateSchema = z.object({
  nome:     z.string().min(1).max(120).trim(),
  email:    z.string().email().max(255).toLowerCase().trim(),
  senha:    z.string().min(6).max(128),
  materias: z.array(z.string().max(120).trim()).optional().default([]),
});

export const ProfessorUpdateSchema = z.object({
  nome:     z.string().min(1).max(120).trim(),
  email:    z.string().email().max(255).toLowerCase().trim(),
  senha:    z.string().min(6).max(128).optional(),
  materias: z.array(z.string().max(120).trim()).optional().default([]),
});
