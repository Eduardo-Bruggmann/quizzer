import Database from 'better-sqlite3'
import bcrypt from 'bcrypt'

const db = new Database('sqlite.db')

const teacherPassword = 'teacher123456'
const studentPassword = 'student123456'

const teacherHash = await bcrypt.hash(teacherPassword, 10)
const studentHash = await bcrypt.hash(studentPassword, 10)

const users = [
  {
    id: 'user-teacher-1',
    full_name: 'Mariana Costa',
    email: 'mariana.costa@school.com',
    password_hash: teacherHash,
    role: 'teacher',
  },
  {
    id: 'user-teacher-2',
    full_name: 'Ricardo Almeida',
    email: 'ricardo.almeida@school.com',
    password_hash: teacherHash,
    role: 'teacher',
  },
  {
    id: 'user-student-1',
    full_name: 'Ana Souza',
    email: 'ana.souza@student.com',
    password_hash: studentHash,
    role: 'student',
  },
  {
    id: 'user-student-2',
    full_name: 'Joao Pereira',
    email: 'joao.pereira@student.com',
    password_hash: studentHash,
    role: 'student',
  },
  {
    id: 'user-student-3',
    full_name: 'Larissa Mendes',
    email: 'larissa.mendes@student.com',
    password_hash: studentHash,
    role: 'student',
  },
]

const subjects = [
  {
    id: 'subject-matematica',
    name: 'Mathematics',
    description: 'Algebra, percentages, geometry, and data interpretation.',
    created_by: 'user-teacher-1',
  },
  {
    id: 'subject-portugues',
    name: 'Portuguese Language',
    description: 'Grammar, interpretation, and linguistic structure.',
    created_by: 'user-teacher-2',
  },
  {
    id: 'subject-historia',
    name: 'Brazilian History',
    description: 'Political periods and key social transformations.',
    created_by: 'user-teacher-2',
  },
  {
    id: 'subject-fisica',
    name: 'Physics',
    description: 'Mechanics, energy, and electricity concepts.',
    created_by: 'user-teacher-1',
  },
  {
    id: 'subject-quimica',
    name: 'Chemistry',
    description: 'Stoichiometry, solutions, and reaction analysis.',
    created_by: 'user-teacher-1',
  },
  {
    id: 'subject-geografia',
    name: 'Geography',
    description: 'Climate, cartography, and geopolitical dynamics.',
    created_by: 'user-teacher-2',
  },
]

const questionBank = [
  {
    id: 'q-mat-1',
    subjectId: 'subject-matematica',
    statement:
      'A product costs $240 and receives a 15% discount. What is the final price?',
    createdBy: 'user-teacher-1',
    alternatives: ['190', '196', '204', '212', '216'],
    correctLabel: 'C',
  },
  {
    id: 'q-mat-2',
    subjectId: 'subject-matematica',
    statement: 'If f(x) = 2x^2 - 3x + 1, what is the value of f(3)?',
    createdBy: 'user-teacher-1',
    alternatives: ['4', '8', '10', '12', '14'],
    correctLabel: 'C',
  },
  {
    id: 'q-mat-3',
    subjectId: 'subject-matematica',
    statement:
      'In a right triangle with legs 9 cm and 12 cm, what is the hypotenuse?',
    createdBy: 'user-teacher-1',
    alternatives: ['13 cm', '14 cm', '15 cm', '16 cm', '18 cm'],
    correctLabel: 'C',
  },
  {
    id: 'q-pt-1',
    subjectId: 'subject-portugues',
    statement:
      'In the sentence "The researchers published a clear summary", which word is the verb?',
    createdBy: 'user-teacher-2',
    alternatives: ['researchers', 'published', 'clear', 'summary', 'the'],
    correctLabel: 'B',
  },
  {
    id: 'q-pt-2',
    subjectId: 'subject-portugues',
    statement:
      'Which option best characterizes a persuasive argumentative text?',
    createdBy: 'user-teacher-2',
    alternatives: [
      'It narrates events in chronological order only.',
      'It presents a thesis and supports it with arguments.',
      'It lists disconnected facts with no position.',
      'It avoids any evidence to remain neutral.',
      'It focuses on rhyme and meter as primary goals.',
    ],
    correctLabel: 'B',
  },
  {
    id: 'q-pt-3',
    subjectId: 'subject-portugues',
    statement:
      'Which conjunction correctly completes the phrase: "She studied hard, ___ she still reviewed before the exam"?',
    createdBy: 'user-teacher-2',
    alternatives: ['because', 'although', 'and', 'therefore', 'if'],
    correctLabel: 'C',
  },
  {
    id: 'q-his-1',
    subjectId: 'subject-historia',
    statement: 'In which year was the Brazilian Republic proclaimed?',
    createdBy: 'user-teacher-2',
    alternatives: ['1822', '1889', '1930', '1964', '1988'],
    correctLabel: 'B',
  },
  {
    id: 'q-his-2',
    subjectId: 'subject-historia',
    statement:
      'Which period in Brazil is marked by strong coffee export growth and oligarchic politics?',
    createdBy: 'user-teacher-2',
    alternatives: [
      'Colonial Brazil',
      'Old Republic',
      'Estado Novo',
      'Military Regime',
      'New Republic',
    ],
    correctLabel: 'B',
  },
  {
    id: 'q-his-3',
    subjectId: 'subject-historia',
    statement:
      'Which event triggered immediate political collapse of the Vargas constitutional period in 1945?',
    createdBy: 'user-teacher-2',
    alternatives: [
      'A direct foreign invasion',
      'Industrial nationalization failure',
      'Military pressure after democratization demands',
      'The extinction of political parties by referendum',
      'A constitutional amendment against elections',
    ],
    correctLabel: 'C',
  },
  {
    id: 'q-fis-1',
    subjectId: 'subject-fisica',
    statement:
      'A car accelerates from 0 to 20 m/s in 5 s. What is its average acceleration?',
    createdBy: 'user-teacher-1',
    alternatives: ['2 m/s^2', '3 m/s^2', '4 m/s^2', '5 m/s^2', '10 m/s^2'],
    correctLabel: 'C',
  },
  {
    id: 'q-fis-2',
    subjectId: 'subject-fisica',
    statement:
      'What is the equivalent resistance of two resistors, 6 ohms and 3 ohms, connected in parallel?',
    createdBy: 'user-teacher-1',
    alternatives: ['1 ohm', '2 ohms', '3 ohms', '4 ohms', '9 ohms'],
    correctLabel: 'B',
  },
  {
    id: 'q-fis-3',
    subjectId: 'subject-fisica',
    statement:
      'A 2 kg object is raised 5 m. Considering g = 10 m/s^2, what is the gain in gravitational potential energy?',
    createdBy: 'user-teacher-1',
    alternatives: ['25 J', '50 J', '75 J', '100 J', '125 J'],
    correctLabel: 'D',
  },
  {
    id: 'q-qui-1',
    subjectId: 'subject-quimica',
    statement:
      'How many moles are in 22 g of CO2? (Molar mass of CO2 = 44 g/mol)',
    createdBy: 'user-teacher-1',
    alternatives: ['0.25 mol', '0.5 mol', '1 mol', '1.5 mol', '2 mol'],
    correctLabel: 'B',
  },
  {
    id: 'q-qui-2',
    subjectId: 'subject-quimica',
    statement: 'Which pH value indicates a strongly acidic solution?',
    createdBy: 'user-teacher-1',
    alternatives: ['2', '5', '7', '9', '12'],
    correctLabel: 'A',
  },
  {
    id: 'q-qui-3',
    subjectId: 'subject-quimica',
    statement: 'Which statement about catalysts is correct?',
    createdBy: 'user-teacher-1',
    alternatives: [
      'They increase activation energy and slow reactions.',
      'They are fully consumed and become products.',
      'They lower activation energy without shifting final equilibrium.',
      'They only work in endothermic reactions.',
      'They change the reaction stoichiometric coefficients.',
    ],
    correctLabel: 'C',
  },
  {
    id: 'q-geo-1',
    subjectId: 'subject-geografia',
    statement:
      'Which biome is known for high biodiversity and an equatorial climate in Brazil?',
    createdBy: 'user-teacher-2',
    alternatives: [
      'Pampa',
      'Caatinga',
      'Cerrado',
      'Amazon Rainforest',
      'Pantanal',
    ],
    correctLabel: 'D',
  },
  {
    id: 'q-geo-2',
    subjectId: 'subject-geografia',
    statement:
      'What map scale is most suitable to detail a single neighborhood?',
    createdBy: 'user-teacher-2',
    alternatives: [
      '1:25,000,000',
      '1:5,000,000',
      '1:500,000',
      '1:50,000',
      '1:5,000',
    ],
    correctLabel: 'E',
  },
  {
    id: 'q-geo-3',
    subjectId: 'subject-geografia',
    statement: 'Which factor most directly intensifies urban heat islands?',
    createdBy: 'user-teacher-2',
    alternatives: [
      'Higher rural humidity',
      'Dense vegetation and permeable soil',
      'High concentration of asphalt and concrete surfaces',
      'Low demographic density',
      'Reduction of anthropogenic heat sources',
    ],
    correctLabel: 'C',
  },
]

const questions = questionBank.map(item => ({
  id: item.id,
  subject_id: item.subjectId,
  statement: item.statement,
  created_by: item.createdBy,
}))

const alternatives = questionBank.flatMap(item =>
  item.alternatives.map((content, index) => {
    const label = String.fromCharCode(65 + index)

    return {
      id: `a-${item.id}-${label.toLowerCase()}`,
      question_id: item.id,
      content,
      is_correct: label === item.correctLabel ? 1 : 0,
    }
  }),
)

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

console.log('Mock data inserted successfully!')
console.log(
  'Teachers: mariana.costa@school.com and ricardo.almeida@school.com (password: teacher123456)',
)
console.log(
  'Students: ana.souza@student.com, joao.pereira@student.com, larissa.mendes@student.com (password: student123456)',
)
