const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const router = express.Router();

// Sample performance review data
let performanceReviews = [
  {
    id: 1,
    employeeId: 'EMP001',
    reviewPeriod: '2024-H1',
    reviewType: 'semi-annual',
    reviewDate: '2024-07-15',
    reviewer: 'Jane Smith',
    status: 'completed',
    overallRating: 4.2,
    ratings: {
      technical: 4.5,
      communication: 4.0,
      teamwork: 4.5,
      leadership: 3.8,
      initiative: 4.0
    },
    goals: [
      {
        id: 1,
        description: 'Complete React certification',
        status: 'achieved',
        completionDate: '2024-05-20'
      },
      {
        id: 2,
        description: 'Lead frontend architecture redesign',
        status: 'in-progress',
        targetDate: '2024-12-31'
      }
    ],
    feedback: {
      strengths: [
        'Excellent technical skills in React and TypeScript',
        'Strong problem-solving abilities',
        'Good collaboration with team members'
      ],
      improvements: [
        'Could take more initiative in cross-team projects',
        'Opportunity to mentor junior developers'
      ],
      comments: 'John has shown consistent growth and technical excellence. He would benefit from taking on more leadership responsibilities.'
    },
    nextReviewDate: '2025-01-15'
  },
  {
    id: 2,
    employeeId: 'EMP002',
    reviewPeriod: '2024-H1',
    reviewType: 'semi-annual',
    reviewDate: '2024-07-10',
    reviewer: 'Bob Johnson',
    status: 'completed',
    overallRating: 4.8,
    ratings: {
      technical: 4.7,
      communication: 5.0,
      teamwork: 4.8,
      leadership: 4.9,
      initiative: 4.6
    },
    goals: [
      {
        id: 1,
        description: 'Implement team OKR process',
        status: 'achieved',
        completionDate: '2024-03-15'
      },
      {
        id: 2,
        description: 'Reduce deployment time by 50%',
        status: 'achieved',
        completionDate: '2024-06-01'
      }
    ],
    feedback: {
      strengths: [
        'Outstanding leadership and team management',
        'Excellent communication skills',
        'Strategic thinking and planning abilities'
      ],
      improvements: [
        'Continue developing technical depth in emerging technologies'
      ],
      comments: 'Jane consistently exceeds expectations and is ready for additional responsibilities.'
    },
    nextReviewDate: '2025-01-10'
  },
  {
    id: 3,
    employeeId: 'EMP004',
    reviewPeriod: '2024-H1',
    reviewType: 'semi-annual',
    reviewDate: '2024-07-20',
    reviewer: 'Carol Brown',
    status: 'completed',
    overallRating: 3.9,
    ratings: {
      technical: 4.2,
      communication: 4.0,
      teamwork: 4.2,
      leadership: 3.5,
      initiative: 3.6
    },
    goals: [
      {
        id: 1,
        description: 'Complete SHRM certification',
        status: 'in-progress',
        targetDate: '2024-12-01'
      },
      {
        id: 2,
        description: 'Implement new onboarding process',
        status: 'achieved',
        completionDate: '2024-04-30'
      }
    ],
    feedback: {
      strengths: [
        'Strong attention to detail in HR processes',
        'Good relationship building with employees',
        'Reliable and consistent performance'
      ],
      improvements: [
        'Develop strategic HR planning skills',
        'Take more initiative in policy development'
      ],
      comments: 'Alice is performing well in her current role and showing potential for growth into more strategic HR work.'
    },
    nextReviewDate: '2025-01-20'
  }
];

// Sample development plans
let developmentPlans = [
  {
    id: 1,
    employeeId: 'EMP001',
    planYear: 2024,
    createdDate: '2024-01-15',
    status: 'active',
    objectives: [
      {
        id: 1,
        title: 'Technical Leadership Development',
        description: 'Develop skills to lead technical initiatives and mentor junior developers',
        category: 'leadership',
        priority: 'high',
        targetDate: '2024-12-31',
        status: 'in-progress',
        actions: [
          'Complete leadership training program',
          'Mentor 2 junior developers',
          'Lead one major technical project'
        ]
      },
      {
        id: 2,
        title: 'Frontend Architecture Expertise',
        description: 'Become expert in modern frontend architecture patterns',
        category: 'technical',
        priority: 'medium',
        targetDate: '2024-09-30',
        status: 'in-progress',
        actions: [
          'Complete advanced React course',
          'Study microfrontend architecture',
          'Present architecture proposal to team'
        ]
      }
    ]
  },
  {
    id: 2,
    employeeId: 'EMP004',
    planYear: 2024,
    createdDate: '2024-02-01',
    status: 'active',
    objectives: [
      {
        id: 1,
        title: 'Strategic HR Development',
        description: 'Develop strategic HR planning and analytics capabilities',
        category: 'strategic',
        priority: 'high',
        targetDate: '2024-12-31',
        status: 'in-progress',
        actions: [
          'Complete HR analytics certification',
          'Shadow director on strategic planning',
          'Lead workforce planning project'
        ]
      }
    ]
  }
];

/**
 * @swagger
 * components:
 *   schemas:
 *     PerformanceReview:
 *       type: object
 *       required:
 *         - employeeId
 *         - reviewPeriod
 *         - reviewType
 *         - reviewer
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated review ID
 *         employeeId:
 *           type: string
 *           description: Employee identifier
 *         reviewPeriod:
 *           type: string
 *           description: Review period (e.g., 2024-H1, 2024-Q2)
 *         reviewType:
 *           type: string
 *           enum: [annual, semi-annual, quarterly, probationary]
 *           description: Type of review
 *         reviewDate:
 *           type: string
 *           format: date
 *           description: Date of review
 *         reviewer:
 *           type: string
 *           description: Name of reviewer
 *         status:
 *           type: string
 *           enum: [draft, in-progress, completed, approved]
 *           description: Review status
 *         overallRating:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *           description: Overall performance rating
 *         ratings:
 *           type: object
 *           properties:
 *             technical:
 *               type: number
 *               minimum: 1
 *               maximum: 5
 *             communication:
 *               type: number
 *               minimum: 1
 *               maximum: 5
 *             teamwork:
 *               type: number
 *               minimum: 1
 *               maximum: 5
 *             leadership:
 *               type: number
 *               minimum: 1
 *               maximum: 5
 *             initiative:
 *               type: number
 *               minimum: 1
 *               maximum: 5
 *         goals:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [not-started, in-progress, achieved, not-achieved]
 *               targetDate:
 *                 type: string
 *                 format: date
 *               completionDate:
 *                 type: string
 *                 format: date
 *         feedback:
 *           type: object
 *           properties:
 *             strengths:
 *               type: array
 *               items:
 *                 type: string
 *             improvements:
 *               type: array
 *               items:
 *                 type: string
 *             comments:
 *               type: string
 *         nextReviewDate:
 *           type: string
 *           format: date
 *     
 *     DevelopmentPlan:
 *       type: object
 *       required:
 *         - employeeId
 *         - planYear
 *       properties:
 *         id:
 *           type: integer
 *         employeeId:
 *           type: string
 *         planYear:
 *           type: integer
 *         createdDate:
 *           type: string
 *           format: date
 *         status:
 *           type: string
 *           enum: [draft, active, completed, cancelled]
 *         objectives:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [technical, leadership, strategic, personal]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               targetDate:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [not-started, in-progress, completed, cancelled]
 *               actions:
 *                 type: array
 *                 items:
 *                   type: string
 */

/**
 * @swagger
 * /api/v1/performance/reviews:
 *   get:
 *     summary: Get all performance reviews
 *     tags: [Performance]
 *     parameters:
 *       - in: query
 *         name: employeeId
 *         schema:
 *           type: string
 *         description: Filter by employee ID
 *       - in: query
 *         name: reviewPeriod
 *         schema:
 *           type: string
 *         description: Filter by review period
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, in-progress, completed, approved]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of performance reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PerformanceReview'
 */
router.get('/reviews', [
  query('employeeId').optional().isString().trim(),
  query('reviewPeriod').optional().isString().trim(),
  query('status').optional().isIn(['draft', 'in-progress', 'completed', 'approved'])
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  let filteredReviews = performanceReviews;

  if (req.query.employeeId) {
    filteredReviews = filteredReviews.filter(review => review.employeeId === req.query.employeeId);
  }

  if (req.query.reviewPeriod) {
    filteredReviews = filteredReviews.filter(review => review.reviewPeriod === req.query.reviewPeriod);
  }

  if (req.query.status) {
    filteredReviews = filteredReviews.filter(review => review.status === req.query.status);
  }

  res.json({
    reviews: filteredReviews,
    total: filteredReviews.length
  });
});

/**
 * @swagger
 * /api/v1/performance/reviews/{id}:
 *   get:
 *     summary: Get performance review by ID
 *     tags: [Performance]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Performance review details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PerformanceReview'
 *       404:
 *         description: Review not found
 */
router.get('/reviews/:id', [
  param('id').isInt({ min: 1 })
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const review = performanceReviews.find(r => r.id === parseInt(req.params.id));
  if (!review) {
    return res.status(404).json({ error: 'Performance review not found' });
  }

  res.json(review);
});

/**
 * @swagger
 * /api/v1/performance/reviews:
 *   post:
 *     summary: Create a new performance review
 *     tags: [Performance]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PerformanceReview'
 *     responses:
 *       201:
 *         description: Performance review created successfully
 *       400:
 *         description: Validation error
 */
router.post('/reviews', [
  body('employeeId').notEmpty().withMessage('Employee ID is required'),
  body('reviewPeriod').notEmpty().withMessage('Review period is required'),
  body('reviewType').isIn(['annual', 'semi-annual', 'quarterly', 'probationary']),
  body('reviewer').notEmpty().withMessage('Reviewer is required'),
  body('overallRating').optional().isFloat({ min: 1, max: 5 })
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const newReview = {
    id: Math.max(...performanceReviews.map(r => r.id)) + 1,
    ...req.body,
    status: req.body.status || 'draft',
    reviewDate: req.body.reviewDate || new Date().toISOString().split('T')[0]
  };

  performanceReviews.push(newReview);
  res.status(201).json(newReview);
});

/**
 * @swagger
 * /api/v1/performance/reviews/{id}:
 *   put:
 *     summary: Update performance review
 *     tags: [Performance]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Review ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PerformanceReview'
 *     responses:
 *       200:
 *         description: Review updated successfully
 *       404:
 *         description: Review not found
 */
router.put('/reviews/:id', [
  param('id').isInt({ min: 1 }),
  body('overallRating').optional().isFloat({ min: 1, max: 5 }),
  body('status').optional().isIn(['draft', 'in-progress', 'completed', 'approved'])
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const reviewIndex = performanceReviews.findIndex(r => r.id === parseInt(req.params.id));
  if (reviewIndex === -1) {
    return res.status(404).json({ error: 'Performance review not found' });
  }

  performanceReviews[reviewIndex] = { ...performanceReviews[reviewIndex], ...req.body };
  res.json(performanceReviews[reviewIndex]);
});

/**
 * @swagger
 * /api/v1/performance/development-plans:
 *   get:
 *     summary: Get all development plans
 *     tags: [Performance]
 *     parameters:
 *       - in: query
 *         name: employeeId
 *         schema:
 *           type: string
 *         description: Filter by employee ID
 *       - in: query
 *         name: planYear
 *         schema:
 *           type: integer
 *         description: Filter by plan year
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, active, completed, cancelled]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of development plans
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DevelopmentPlan'
 */
router.get('/development-plans', [
  query('employeeId').optional().isString().trim(),
  query('planYear').optional().isInt({ min: 2020, max: 2030 }),
  query('status').optional().isIn(['draft', 'active', 'completed', 'cancelled'])
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  let filteredPlans = developmentPlans;

  if (req.query.employeeId) {
    filteredPlans = filteredPlans.filter(plan => plan.employeeId === req.query.employeeId);
  }

  if (req.query.planYear) {
    filteredPlans = filteredPlans.filter(plan => plan.planYear === parseInt(req.query.planYear));
  }

  if (req.query.status) {
    filteredPlans = filteredPlans.filter(plan => plan.status === req.query.status);
  }

  res.json({
    plans: filteredPlans,
    total: filteredPlans.length
  });
});

/**
 * @swagger
 * /api/v1/performance/development-plans:
 *   post:
 *     summary: Create a new development plan
 *     tags: [Performance]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DevelopmentPlan'
 *     responses:
 *       201:
 *         description: Development plan created successfully
 *       400:
 *         description: Validation error
 */
router.post('/development-plans', [
  body('employeeId').notEmpty().withMessage('Employee ID is required'),
  body('planYear').isInt({ min: 2020, max: 2030 }).withMessage('Valid plan year is required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const newPlan = {
    id: Math.max(...developmentPlans.map(p => p.id)) + 1,
    ...req.body,
    createdDate: new Date().toISOString().split('T')[0],
    status: req.body.status || 'draft'
  };

  developmentPlans.push(newPlan);
  res.status(201).json(newPlan);
});

/**
 * @swagger
 * /api/v1/performance/analytics:
 *   get:
 *     summary: Get performance analytics
 *     tags: [Performance]
 *     parameters:
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter by department
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *         description: Analysis period
 *     responses:
 *       200:
 *         description: Performance analytics data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 averageRating:
 *                   type: number
 *                 ratingDistribution:
 *                   type: object
 *                 departmentAverages:
 *                   type: object
 *                 goalAchievementRate:
 *                   type: number
 */
router.get('/analytics', (req, res) => {
  // Calculate analytics from performance data
  const completedReviews = performanceReviews.filter(r => r.status === 'completed');
  
  const averageRating = completedReviews.reduce((sum, review) => sum + review.overallRating, 0) / completedReviews.length;
  
  const ratingDistribution = completedReviews.reduce((dist, review) => {
    const rating = Math.floor(review.overallRating);
    dist[rating] = (dist[rating] || 0) + 1;
    return dist;
  }, {});

  const totalGoals = completedReviews.reduce((sum, review) => sum + review.goals.length, 0);
  const achievedGoals = completedReviews.reduce((sum, review) => 
    sum + review.goals.filter(goal => goal.status === 'achieved').length, 0);
  const goalAchievementRate = (achievedGoals / totalGoals) * 100;

  res.json({
    period: req.query.period || 'current',
    totalReviews: completedReviews.length,
    averageRating: Math.round(averageRating * 100) / 100,
    ratingDistribution,
    goalAchievementRate: Math.round(goalAchievementRate * 100) / 100,
    topPerformers: completedReviews
      .filter(r => r.overallRating >= 4.5)
      .map(r => ({ employeeId: r.employeeId, rating: r.overallRating }))
      .slice(0, 5)
  });
});

module.exports = router;