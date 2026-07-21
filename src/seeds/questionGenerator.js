import { CURRICULUM, DIFFICULTIES, XP_REWARDS } from '../config/constants.js';

const questionTemplates = {
  Triangles: {
    Easy: (n) => ({
      question: `What is the sum of angles in a triangle? (Set ${n})`,
      options: ['90°', '180°', '270°', '360°'],
      correctAnswer: '180°',
      explanation: 'The sum of interior angles in any triangle is always 180°.',
      hint: 'Think about how many degrees are in a straight line.',
    }),
    Medium: (n) => ({
      question: `A triangle has angles 50° and 60°. What is the third angle? (Q${n})`,
      options: ['60°', '70°', '80°', '90°'],
      correctAnswer: '70°',
      explanation: '180° - 50° - 60° = 70°.',
      hint: 'Subtract the known angles from 180°.',
    }),
    Hard: (n) => ({
      question: `An isosceles triangle has a vertex angle of 40°. Find each base angle. (Q${n})`,
      options: ['60°', '70°', '80°', '90°'],
      correctAnswer: '70°',
      explanation: '(180° - 40°) / 2 = 70° for each base angle.',
      hint: 'Base angles are equal in an isosceles triangle.',
    }),
  },
  Circles: {
    Easy: (n) => ({
      question: `What is the formula for circumference of a circle? (Q${n})`,
      options: ['πr', '2πr', 'πr²', '2πr²'],
      correctAnswer: '2πr',
      explanation: 'Circumference = 2πr where r is the radius.',
      hint: 'It involves the radius and pi.',
    }),
    Medium: (n) => ({
      question: `Find the area of a circle with radius 5. (Q${n})`,
      options: ['25π', '10π', '5π', '50π'],
      correctAnswer: '25π',
      explanation: 'Area = πr² = π(5)² = 25π.',
      hint: 'Use the formula A = πr².',
    }),
    Hard: (n) => ({
      question: `A chord subtends 90° at the center. If radius is 7, find chord length. (Q${n})`,
      options: ['7√2', '14', '7', '14√2'],
      correctAnswer: '7√2',
      explanation: 'Chord = 2r·sin(θ/2) = 2(7)sin(45°) = 7√2.',
      hint: 'Use the chord formula with half the central angle.',
    }),
  },
  Polygons: {
    Easy: (n) => ({
      question: `How many sides does a hexagon have? (Q${n})`,
      options: ['5', '6', '7', '8'],
      correctAnswer: '6',
      explanation: 'Hexa means six, so a hexagon has 6 sides.',
      hint: 'The prefix "hexa" gives a clue.',
    }),
    Medium: (n) => ({
      question: `Sum of interior angles of a pentagon? (Q${n})`,
      options: ['360°', '540°', '720°', '900°'],
      correctAnswer: '540°',
      explanation: '(n-2)×180° = 3×180° = 540° for n=5.',
      hint: 'Use (n-2)×180° where n is number of sides.',
    }),
    Hard: (n) => ({
      question: `A regular octagon has side 4. Find approximate perimeter. (Q${n})`,
      options: ['24', '28', '32', '36'],
      correctAnswer: '32',
      explanation: 'Perimeter = 8 × side = 8 × 4 = 32.',
      hint: 'Multiply number of sides by side length.',
    }),
  },
  Angles: {
    Easy: (n) => ({
      question: `Two complementary angles sum to? (Q${n})`,
      options: ['90°', '180°', '270°', '360°'],
      correctAnswer: '90°',
      explanation: 'Complementary angles add up to 90°.',
      hint: 'Think of a right angle.',
    }),
    Medium: (n) => ({
      question: `If two angles are supplementary and one is 65°, find the other. (Q${n})`,
      options: ['105°', '115°', '125°', '135°'],
      correctAnswer: '115°',
      explanation: '180° - 65° = 115°.',
      hint: 'Supplementary angles sum to 180°.',
    }),
    Hard: (n) => ({
      question: `Vertical angles are always? (Q${n})`,
      options: ['Complementary', 'Supplementary', 'Equal', 'Unequal'],
      correctAnswer: 'Equal',
      explanation: 'Vertical angles formed by intersecting lines are always equal.',
      hint: 'Look at opposite angles when two lines cross.',
    }),
  },
  Perimeter: {
    Easy: (n) => ({
      question: `Perimeter of a square with side 5? (Q${n})`,
      options: ['15', '20', '25', '30'],
      correctAnswer: '20',
      explanation: 'Perimeter = 4 × side = 4 × 5 = 20.',
      hint: 'A square has 4 equal sides.',
    }),
    Medium: (n) => ({
      question: `Rectangle: length 8, width 3. Perimeter? (Q${n})`,
      options: ['22', '24', '26', '28'],
      correctAnswer: '22',
      explanation: 'P = 2(l + w) = 2(8 + 3) = 22.',
      hint: 'Add length and width, then multiply by 2.',
    }),
    Hard: (n) => ({
      question: `Equilateral triangle side 12. Perimeter? (Q${n})`,
      options: ['24', '30', '36', '48'],
      correctAnswer: '36',
      explanation: 'P = 3 × side = 3 × 12 = 36.',
      hint: 'All three sides are equal.',
    }),
  },
  Area: {
    Easy: (n) => ({
      question: `Area of rectangle 4×6? (Q${n})`,
      options: ['20', '24', '28', '32'],
      correctAnswer: '24',
      explanation: 'Area = length × width = 4 × 6 = 24.',
      hint: 'Multiply the two dimensions.',
    }),
    Medium: (n) => ({
      question: `Triangle: base 10, height 6. Area? (Q${n})`,
      options: ['30', '60', '16', '36'],
      correctAnswer: '30',
      explanation: 'Area = ½ × base × height = ½ × 10 × 6 = 30.',
      hint: 'Use A = ½bh.',
    }),
    Hard: (n) => ({
      question: `Trapezoid: bases 8 and 12, height 5. Area? (Q${n})`,
      options: ['40', '50', '60', '100'],
      correctAnswer: '50',
      explanation: 'A = ½(a+b)h = ½(8+12)(5) = 50.',
      hint: 'Average the two bases, then multiply by height.',
    }),
  },
  Volume: {
    Easy: (n) => ({
      question: `Volume of cube with side 3? (Q${n})`,
      options: ['9', '18', '27', '36'],
      correctAnswer: '27',
      explanation: 'V = side³ = 3³ = 27.',
      hint: 'Cube volume is side cubed.',
    }),
    Medium: (n) => ({
      question: `Cylinder: r=2, h=5. Volume? (Q${n})`,
      options: ['10π', '20π', '25π', '40π'],
      correctAnswer: '20π',
      explanation: 'V = πr²h = π(4)(5) = 20π.',
      hint: 'Use V = πr²h.',
    }),
    Hard: (n) => ({
      question: `Sphere radius 3. Volume? (Q${n})`,
      options: ['12π', '27π', '36π', '108π'],
      correctAnswer: '36π',
      explanation: 'V = (4/3)πr³ = (4/3)π(27) = 36π.',
      hint: 'Use the sphere volume formula.',
    }),
  },
  'Linear Equations': {
    Easy: (n) => ({
      question: `Solve: x + 5 = 12 (Q${n})`,
      options: ['5', '6', '7', '8'],
      correctAnswer: '7',
      explanation: 'x = 12 - 5 = 7.',
      hint: 'Subtract 5 from both sides.',
    }),
    Medium: (n) => ({
      question: `Solve: 3x - 7 = 14 (Q${n})`,
      options: ['5', '6', '7', '8'],
      correctAnswer: '7',
      explanation: '3x = 21, x = 7.',
      hint: 'Add 7 first, then divide by 3.',
    }),
    Hard: (n) => ({
      question: `Solve: 2(x + 3) = 4x - 2 (Q${n})`,
      options: ['2', '3', '4', '5'],
      correctAnswer: '4',
      explanation: '2x + 6 = 4x - 2 → 8 = 2x → x = 4.',
      hint: 'Expand brackets first.',
    }),
  },
  'Quadratic Equations': {
    Easy: (n) => ({
      question: `Solve: x² = 16 (Q${n})`,
      options: ['±2', '±4', '±8', '4 only'],
      correctAnswer: '±4',
      explanation: 'x = ±√16 = ±4.',
      hint: 'Take the square root of both sides.',
    }),
    Medium: (n) => ({
      question: `Factor: x² + 5x + 6 = 0. Smaller root? (Q${n})`,
      options: ['-3', '-2', '2', '3'],
      correctAnswer: '-3',
      explanation: '(x+2)(x+3)=0, roots are -2 and -3.',
      hint: 'Find two numbers that multiply to 6 and add to 5.',
    }),
    Hard: (n) => ({
      question: `x² - 6x + 9 = 0. Root? (Q${n})`,
      options: ['3', '-3', '±3', '9'],
      correctAnswer: '3',
      explanation: '(x-3)² = 0, so x = 3 (repeated root).',
      hint: 'This is a perfect square trinomial.',
    }),
  },
  Expansion: {
    Easy: (n) => ({
      question: `Expand: 2(x + 3) (Q${n})`,
      options: ['2x + 3', '2x + 6', 'x + 6', '2x + 5'],
      correctAnswer: '2x + 6',
      explanation: '2(x + 3) = 2x + 6.',
      hint: 'Distribute 2 to each term inside.',
    }),
    Medium: (n) => ({
      question: `Expand: (x + 2)(x + 3) (Q${n})`,
      options: ['x² + 5x + 6', 'x² + 6x + 5', 'x² + 5x + 5', '2x + 5'],
      correctAnswer: 'x² + 5x + 6',
      explanation: 'FOIL: x² + 3x + 2x + 6 = x² + 5x + 6.',
      hint: 'Use FOIL method.',
    }),
    Hard: (n) => ({
      question: `Expand: (2x - 1)² (Q${n})`,
      options: ['4x² - 4x + 1', '4x² - 2x + 1', '4x² - 1', '2x² - 2x + 1'],
      correctAnswer: '4x² - 4x + 1',
      explanation: '(2x)² - 2(2x)(1) + 1² = 4x² - 4x + 1.',
      hint: 'Use (a-b)² = a² - 2ab + b².',
    }),
  },
  Factorization: {
    Easy: (n) => ({
      question: `Factor: 6x + 12 (Q${n})`,
      options: ['6(x+2)', '3(x+4)', '2(3x+6)', 'x(6+12)'],
      correctAnswer: '6(x+2)',
      explanation: 'GCF is 6: 6(x + 2).',
      hint: 'Find the greatest common factor.',
    }),
    Medium: (n) => ({
      question: `Factor: x² - 9 (Q${n})`,
      options: ['(x-3)²', '(x+3)(x-3)', '(x-9)(x+1)', 'x(x-9)'],
      correctAnswer: '(x+3)(x-3)',
      explanation: 'Difference of squares: a² - b² = (a+b)(a-b).',
      hint: 'This is a difference of two squares.',
    }),
    Hard: (n) => ({
      question: `Factor: 2x² + 7x + 3 (Q${n})`,
      options: ['(2x+1)(x+3)', '(x+1)(2x+3)', '(2x+3)(x+1)', '(x+3)(2x+1)'],
      correctAnswer: '(2x+1)(x+3)',
      explanation: '2x² + 7x + 3 = (2x+1)(x+3).',
      hint: 'Look for factors of 2×3=6 that add to 7.',
    }),
  },
  Fractions: {
    Easy: (n) => ({
      question: `Simplify: 4/8 (Q${n})`,
      options: ['1/4', '1/2', '2/3', '3/4'],
      correctAnswer: '1/2',
      explanation: '4/8 = 1/2 (divide numerator and denominator by 4).',
      hint: 'Find the GCF of 4 and 8.',
    }),
    Medium: (n) => ({
      question: `1/3 + 1/6 = ? (Q${n})`,
      options: ['1/9', '1/2', '2/9', '1/4'],
      correctAnswer: '1/2',
      explanation: '2/6 + 1/6 = 3/6 = 1/2.',
      hint: 'Find a common denominator.',
    }),
    Hard: (n) => ({
      question: `2/3 × 3/4 = ? (Q${n})`,
      options: ['1/2', '5/7', '6/12', '5/12'],
      correctAnswer: '1/2',
      explanation: '2/3 × 3/4 = 6/12 = 1/2.',
      hint: 'Multiply numerators and denominators.',
    }),
  },
  Factorials: {
    Easy: (n) => ({
      question: `5! = ? (Q${n})`,
      options: ['20', '60', '120', '720'],
      correctAnswer: '120',
      explanation: '5! = 5×4×3×2×1 = 120.',
      hint: 'Multiply all integers from 1 to 5.',
    }),
    Medium: (n) => ({
      question: `7! / 5! = ? (Q${n})`,
      options: ['21', '42', '56', '84'],
      correctAnswer: '42',
      explanation: '7!/5! = 7×6 = 42.',
      hint: 'Cancel out 5! from numerator and denominator.',
    }),
    Hard: (n) => ({
      question: `0! = ? (Q${n})`,
      options: ['0', '1', 'undefined', '-1'],
      correctAnswer: '1',
      explanation: 'By definition, 0! = 1.',
      hint: 'This is a special mathematical convention.',
    }),
  },
  Permutations: {
    Easy: (n) => ({
      question: `P(5,2) = ? (Q${n})`,
      options: ['10', '15', '20', '25'],
      correctAnswer: '20',
      explanation: 'P(5,2) = 5×4 = 20.',
      hint: 'Order matters in permutations.',
    }),
    Medium: (n) => ({
      question: `How many ways to arrange 3 books? (Q${n})`,
      options: ['3', '6', '9', '12'],
      correctAnswer: '6',
      explanation: '3! = 6 arrangements.',
      hint: 'Use factorial for full arrangements.',
    }),
    Hard: (n) => ({
      question: `P(8,3) = ? (Q${n})`,
      options: ['56', '168', '336', '512'],
      correctAnswer: '336',
      explanation: 'P(8,3) = 8×7×6 = 336.',
      hint: 'Multiply 3 descending numbers starting from 8.',
    }),
  },
  Combinations: {
    Easy: (n) => ({
      question: `C(5,2) = ? (Q${n})`,
      options: ['5', '10', '15', '20'],
      correctAnswer: '10',
      explanation: 'C(5,2) = 5!/(2!×3!) = 10.',
      hint: 'Order does not matter in combinations.',
    }),
    Medium: (n) => ({
      question: `Choose 3 from 6 students: C(6,3)? (Q${n})`,
      options: ['15', '20', '30', '120'],
      correctAnswer: '20',
      explanation: 'C(6,3) = 6!/(3!×3!) = 20.',
      hint: 'Use the combination formula.',
    }),
    Hard: (n) => ({
      question: `C(10,2) = ? (Q${n})`,
      options: ['20', '45', '90', '100'],
      correctAnswer: '45',
      explanation: 'C(10,2) = 10×9/2 = 45.',
      hint: 'Use n!/(r!(n-r)!).',
    }),
  },
};

function getDefaultTemplate(topic, difficulty, n) {
  return {
    question: `(${difficulty}) Sample question about ${topic} #${n}`,
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswer: 'Option A',
    explanation: `This explains the answer for ${topic} question ${n}.`,
    hint: `Think about the key concept in ${topic}.`,
  };
}

export function generateQuestions(count = 500) {
  const allTopics = [];
  for (const [category, topics] of Object.entries(CURRICULUM)) {
    for (const topic of topics) {
      allTopics.push({ category, topic });
    }
  }

  const combos = allTopics.flatMap(({ category, topic }) =>
    DIFFICULTIES.map((difficulty) => ({ category, topic, difficulty }))
  );
  const perCombo = Math.max(1, Math.floor(count / combos.length));
  const questions = [];

  for (const { category, topic, difficulty } of combos) {
    for (let n = 1; n <= perCombo && questions.length < count; n++) {
      const templates = questionTemplates[topic];
      const templateFn = templates?.[difficulty] || getDefaultTemplate;
      const data = typeof templateFn === 'function' ? templateFn(n) : templateFn(topic, difficulty, n);

      questions.push({
        category,
        topic,
        difficulty,
        question: data.question,
        options: data.options,
        correctAnswer: data.correctAnswer,
        explanation: data.explanation,
        hint: data.hint,
        points: XP_REWARDS[difficulty],
      });
    }
  }

  let n = 1;
  while (questions.length < count) {
    const { category, topic, difficulty } = combos[questions.length % combos.length];
    const templates = questionTemplates[topic];
    const templateFn = templates?.[difficulty] || getDefaultTemplate;
    const data = typeof templateFn === 'function' ? templateFn(n) : templateFn(topic, difficulty, n);

    questions.push({
      category,
      topic,
      difficulty,
      question: data.question,
      options: data.options,
      correctAnswer: data.correctAnswer,
      explanation: data.explanation,
      hint: data.hint,
      points: XP_REWARDS[difficulty],
    });
    n++;
  }

  return questions;
}

export function generateLessons() {
  const lessons = [];
  for (const [category, topics] of Object.entries(CURRICULUM)) {
    topics.forEach((topic, i) => {
      lessons.push({
        category,
        topic,
        title: `Introduction to ${topic}`,
        content: `Learn the fundamentals of ${topic} in ${category}. This lesson covers key concepts, formulas, and problem-solving strategies to help you master ${topic}.`,
        difficulty: DIFFICULTIES[i % DIFFICULTIES.length],
        order: i,
      });
    });
  }
  return lessons;
}
