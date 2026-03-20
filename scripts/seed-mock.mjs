import Database from 'better-sqlite3'
import bcrypt from 'bcrypt'

const db = new Database('sqlite.db')

const teacherPassword = 'prof123456'
const studentPassword = 'aluno123456'

const teacherHash = await bcrypt.hash(teacherPassword, 10)
const studentHash = await bcrypt.hash(studentPassword, 10)

const users = [
  {
    id: 'user-teacher-1',
    full_name: 'Mariana Costa',
    email: 'mariana.costa@escola.com',
    password_hash: teacherHash,
    role: 'teacher',
  },
  {
    id: 'user-teacher-2',
    full_name: 'Ricardo Almeida',
    email: 'ricardo.almeida@escola.com',
    password_hash: teacherHash,
    role: 'teacher',
  },
  {
    id: 'user-student-1',
    full_name: 'Ana Souza',
    email: 'ana.souza@aluno.com',
    password_hash: studentHash,
    role: 'student',
  },
  {
    id: 'user-student-2',
    full_name: 'João Pereira',
    email: 'joao.pereira@aluno.com',
    password_hash: studentHash,
    role: 'student',
  },
  {
    id: 'user-student-3',
    full_name: 'Larissa Mendes',
    email: 'larissa.mendes@aluno.com',
    password_hash: studentHash,
    role: 'student',
  },
]

const subjects = [
  {
    id: 'subject-matematica',
    name: 'Matemática',
    description: 'Operações básicas, frações e porcentagem.',
    created_by: 'user-teacher-1',
  },
  {
    id: 'subject-portugues',
    name: 'Português',
    description: 'Interpretação de texto e gramática.',
    created_by: 'user-teacher-2',
  },
  {
    id: 'subject-historia',
    name: 'História do Brasil',
    description: 'Períodos históricos e acontecimentos marcantes.',
    created_by: 'user-teacher-2',
  },
]

const questions = [
  {
    id: 'q-mat-1',
    subject_id: 'subject-matematica',
    statement: 'Quanto é 25% de 200?',
    created_by: 'user-teacher-1',
  },
  {
    id: 'q-mat-2',
    subject_id: 'subject-matematica',
    statement: 'Qual é o resultado de 7 × 8?',
    created_by: 'user-teacher-1',
  },
  {
    id: 'q-pt-1',
    subject_id: 'subject-portugues',
    statement: 'Na frase "Os alunos estudaram bastante", qual é o verbo?',
    created_by: 'user-teacher-2',
  },
  {
    id: 'q-pt-2',
    subject_id: 'subject-portugues',
    statement: 'Qual alternativa apresenta uma palavra oxítona?',
    created_by: 'user-teacher-2',
  },
  {
    id: 'q-his-1',
    subject_id: 'subject-historia',
    statement: 'Em que ano ocorreu a Proclamação da República no Brasil?',
    created_by: 'user-teacher-2',
  },
]

const alternatives = [
  { id: 'a-mat-1-1', question_id: 'q-mat-1', content: '25', is_correct: 0 },
  { id: 'a-mat-1-2', question_id: 'q-mat-1', content: '40', is_correct: 0 },
  { id: 'a-mat-1-3', question_id: 'q-mat-1', content: '50', is_correct: 1 },
  { id: 'a-mat-1-4', question_id: 'q-mat-1', content: '75', is_correct: 0 },

  { id: 'a-mat-2-1', question_id: 'q-mat-2', content: '54', is_correct: 0 },
  { id: 'a-mat-2-2', question_id: 'q-mat-2', content: '56', is_correct: 1 },
  { id: 'a-mat-2-3', question_id: 'q-mat-2', content: '64', is_correct: 0 },
  { id: 'a-mat-2-4', question_id: 'q-mat-2', content: '58', is_correct: 0 },

  {
    id: 'a-pt-1-1',
    question_id: 'q-pt-1',
    content: 'alunos',
    is_correct: 0,
  },
  {
    id: 'a-pt-1-2',
    question_id: 'q-pt-1',
    content: 'estudaram',
    is_correct: 1,
  },
  { id: 'a-pt-1-3', question_id: 'q-pt-1', content: 'bastante', is_correct: 0 },
  { id: 'a-pt-1-4', question_id: 'q-pt-1', content: 'os', is_correct: 0 },

  { id: 'a-pt-2-1', question_id: 'q-pt-2', content: 'mesa', is_correct: 0 },
  { id: 'a-pt-2-2', question_id: 'q-pt-2', content: 'fácil', is_correct: 0 },
  { id: 'a-pt-2-3', question_id: 'q-pt-2', content: 'café', is_correct: 1 },
  { id: 'a-pt-2-4', question_id: 'q-pt-2', content: 'janela', is_correct: 0 },

  { id: 'a-his-1-1', question_id: 'q-his-1', content: '1822', is_correct: 0 },
  { id: 'a-his-1-2', question_id: 'q-his-1', content: '1889', is_correct: 1 },
  { id: 'a-his-1-3', question_id: 'q-his-1', content: '1930', is_correct: 0 },
  { id: 'a-his-1-4', question_id: 'q-his-1', content: '1964', is_correct: 0 },
]

const clearData = db.transaction(() => {
  db.prepare('DELETE FROM alternatives').run()
  db.prepare('DELETE FROM questions').run()
  db.prepare('DELETE FROM subjects').run()
  db.prepare('DELETE FROM users').run()
})

const insertData = db.transaction(() => {
  const insertUser = db.prepare(`
    INSERT INTO users (id, full_name, email, password_hash, role)
    VALUES (@id, @full_name, @email, @password_hash, @role)
  `)

  const insertSubject = db.prepare(`
    INSERT INTO subjects (id, name, description, created_by)
    VALUES (@id, @name, @description, @created_by)
  `)

  const insertQuestion = db.prepare(`
    INSERT INTO questions (id, subject_id, statement, created_by)
    VALUES (@id, @subject_id, @statement, @created_by)
  `)

  const insertAlternative = db.prepare(`
    INSERT INTO alternatives (id, question_id, content, is_correct)
    VALUES (@id, @question_id, @content, @is_correct)
  `)

  for (const user of users) insertUser.run(user)
  for (const subject of subjects) insertSubject.run(subject)
  for (const question of questions) insertQuestion.run(question)
  for (const alternative of alternatives) insertAlternative.run(alternative)
})

clearData()
insertData()

db.close()

console.log('Dados mockados inseridos com sucesso!')
console.log(
  'Professores: mariana.costa@escola.com e ricardo.almeida@escola.com (senha: prof123456)',
)
console.log(
  'Alunos: ana.souza@aluno.com, joao.pereira@aluno.com, larissa.mendes@aluno.com (senha: aluno123456)',
)
