const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const router = express.Router();

// Sample job postings data
let jobs = [
  {
    id: 1,
    title: 'Senior Frontend Developer',
    department: 'Engineering',
    location: 'New York',
    type: 'full-time',
    level: 'senior',
    salary: {
      min: 90000,
      max: 120000,
      currency: 'USD'
    },
    description: 'We are looking for an experienced Frontend Developer to join our engineering team. You will be responsible for building user-facing features using React and modern web technologies.',
    requirements: [
      '5+ years of experience with React',
      'Strong knowledge of JavaScript/TypeScript',
      'Experience with CSS frameworks',
      'Knowledge of state management libraries',
      'Bachelor\'s degree in Computer Science or related field'
    ],
    benefits: [
      'Health insurance',
      'Dental and vision coverage',
      '401k matching',
      'Flexible work hours',
      'Remote work options'
    ],
    postedDate: '2024-01-15',
    closingDate: '2024-02-15',
    status: 'open',
    hiringManager: 'Jane Smith',
    applicantCount: 25
  },
  {
    id: 2,
    title: 'DevOps Engineer',
    department: 'Engineering',
    location: 'San Francisco',
    type: 'full-time',
    level: 'mid',
    salary: {
      min: 100000,
      max: 140000,
      currency: 'USD'
    },
    description: 'Join our DevOps team to help scale our infrastructure and improve deployment processes. You will work with Kubernetes, AWS, and CI/CD pipelines.',
    requirements: [
      '3+ years of DevOps experience',
      'Experience with Kubernetes and Docker',
      'Knowledge of AWS or similar cloud platforms',
      'Familiarity with CI/CD tools',
      'Scripting experience (Python, Bash)'
    ],
    benefits: [
      'Health insurance',
      'Stock options',
      'Professional development budget',
      'Flexible PTO',
      'Remote work options'
    ],
    postedDate: '2024-01-20',
    closingDate: '2024-02-20',
    status: 'open',
    hiringManager: 'Bob Johnson',
    applicantCount: 18
  },
  {
    id: 3,
    title: 'HR Business Partner',
    department: 'Human Resources',
    location: 'Chicago',
    type: 'full-time',
    level: 'senior',
    salary: {
      min: 80000,
      max: 100000,
      currency: 'USD'
    },
    description: 'We are seeking an experienced HR Business Partner to support our growing organization. You will partner with business leaders to develop HR strategies and programs.',
    requirements: [
      '7+ years of HR experience',
      'Experience as an HR Business Partner',
      'Strong knowledge of employment law',
      'Excellent communication skills',
      'SHRM or HRCI certification preferred'
    ],
    benefits: [
      'Comprehensive health benefits',
      'Retirement plan with matching',
      'Professional development opportunities',
      'Flexible work arrangements',
      'Generous PTO policy'
    ],
    postedDate: '2024-01-10',
    closingDate: '2024-02-10',
    status: 'closed',
    hiringManager: 'Carol Brown',
    applicantCount: 42
  },
  {
    id: 4,
    title: 'Data Scientist',
    department: 'Data',
    location: 'Remote',
    type: 'full-time',
    level: 'mid',
    salary: {
      min: 95000,
      max: 130000,
      currency: 'USD'
    },
    description: 'Join our data team to analyze complex datasets and build machine learning models. You will work on projects that drive business insights and decision-making.',
    requirements: [
      'Master\'s degree in Data Science, Statistics, or related field',
      '3+ years of experience in data science',
      'Proficiency in Python and SQL',
      'Experience with machine learning frameworks',
      'Strong statistical analysis skills'
    ],
    benefits: [
      'Competitive salary and equity',
      'Health and wellness benefits',
      'Learning and development budget',
      'Fully remote work',
      'Quarterly team retreats'
    ],
    postedDate: '2024-01-25',
    closingDate: '2024-03-01',
    status: 'open',
    hiringManager: 'David Wilson',
    applicantCount: 31
  }
];

// Sample job applications
let applications = [
  {
    id: 1,
    jobId: 1,
    applicantName: 'Sarah Johnson',
    applicantEmail: 'sarah.johnson@email.com',
    resumeUrl: '/resumes/sarah_johnson.pdf',
    coverLetter: 'I am excited to apply for the Senior Frontend Developer position...',
    applicationDate: '2024-01-20',
    status: 'under_review',
    notes: 'Strong React experience, scheduled for technical interview'
  },
  {
    id: 2,
    jobId: 1,
    applicantName: 'Michael Chen',
    applicantEmail: 'michael.chen@email.com',
    resumeUrl: '/resumes/michael_chen.pdf',
    coverLetter: 'With over 6 years of frontend development experience...',
    applicationDate: '2024-01-22',
    status: 'interviewed',
    notes: 'Excellent technical skills, proceeding to final round'
  },
  {
    id: 3,
    jobId: 2,
    applicantName: 'Lisa Park',
    applicantEmail: 'lisa.park@email.com',
    resumeUrl: '/resumes/lisa_park.pdf',
    coverLetter: 'I am passionate about DevOps and infrastructure automation...',
    applicationDate: '2024-01-25',
    status: 'new',
    notes: 'Initial application received'
  }
];

/**
 * @swagger
 * components:
 *   schemas:
 *     Job:
 *       type: object
 *       required:
 *         - title
 *         - department
 *         - location
 *         - type
 *         - level
 *         - description
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated job ID
 *         title:
 *           type: string
 *           description: Job title
 *         department:
 *           type: string
 *           description: Department name
 *         location:
 *           type: string
 *           description: Job location
 *         type:
 *           type: string
 *           enum: [full-time, part-time, contract, internship]
 *           description: Employment type
 *         level:
 *           type: string
 *           enum: [entry, junior, mid, senior, executive]
 *           description: Job level
 *         salary:
 *           type: object
 *           properties:
 *             min:
 *               type: number
 *             max:
 *               type: number
 *             currency:
 *               type: string
 *         description:
 *           type: string
 *           description: Job description
 *         requirements:
 *           type: array
 *           items:
 *             type: string
 *         benefits:
 *           type: array
 *           items:
 *             type: string
 *         postedDate:
 *           type: string
 *           format: date
 *         closingDate:
 *           type: string
 *           format: date
 *         status:
 *           type: string
 *           enum: [open, closed, on_hold]
 *         hiringManager:
 *           type: string
 *         applicantCount:
 *           type: integer
 *     
 *     JobApplication:
 *       type: object
 *       required:
 *         - jobId
 *         - applicantName
 *         - applicantEmail
 *       properties:
 *         id:
 *           type: integer
 *         jobId:
 *           type: integer
 *         applicantName:
 *           type: string
 *         applicantEmail:
 *           type: string
 *           format: email
 *         resumeUrl:
 *           type: string
 *         coverLetter:
 *           type: string
 *         applicationDate:
 *           type: string
 *           format: date
 *         status:
 *           type: string
 *           enum: [new, under_review, interviewed, rejected, hired]
 *         notes:
 *           type: string
 */

/**
 * @swagger
 * /api/v1/jobs:
 *   get:
 *     summary: Get all job postings
 *     tags: [Jobs]
 *     parameters:
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter by department
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [full-time, part-time, contract, internship]
 *         description: Filter by employment type
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [entry, junior, mid, senior, executive]
 *         description: Filter by job level
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, closed, on_hold]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of job postings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Job'
 */
router.get('/', [
  query('department').optional().isString().trim(),
  query('location').optional().isString().trim(),
  query('type').optional().isIn(['full-time', 'part-time', 'contract', 'internship']),
  query('level').optional().isIn(['entry', 'junior', 'mid', 'senior', 'executive']),
  query('status').optional().isIn(['open', 'closed', 'on_hold'])
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  let filteredJobs = jobs;

  if (req.query.department) {
    filteredJobs = filteredJobs.filter(job => 
      job.department.toLowerCase().includes(req.query.department.toLowerCase())
    );
  }

  if (req.query.location) {
    filteredJobs = filteredJobs.filter(job => 
      job.location.toLowerCase().includes(req.query.location.toLowerCase())
    );
  }

  if (req.query.type) {
    filteredJobs = filteredJobs.filter(job => job.type === req.query.type);
  }

  if (req.query.level) {
    filteredJobs = filteredJobs.filter(job => job.level === req.query.level);
  }

  if (req.query.status) {
    filteredJobs = filteredJobs.filter(job => job.status === req.query.status);
  }

  res.json({
    jobs: filteredJobs,
    total: filteredJobs.length
  });
});

/**
 * @swagger
 * /api/v1/jobs/{id}:
 *   get:
 *     summary: Get job by ID
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       404:
 *         description: Job not found
 */
router.get('/:id', [
  param('id').isInt({ min: 1 })
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const job = jobs.find(j => j.id === parseInt(req.params.id));
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  res.json(job);
});

/**
 * @swagger
 * /api/v1/jobs:
 *   post:
 *     summary: Create a new job posting
 *     tags: [Jobs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Job'
 *     responses:
 *       201:
 *         description: Job created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', [
  body('title').notEmpty().withMessage('Job title is required'),
  body('department').notEmpty().withMessage('Department is required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('type').isIn(['full-time', 'part-time', 'contract', 'internship']),
  body('level').isIn(['entry', 'junior', 'mid', 'senior', 'executive']),
  body('description').notEmpty().withMessage('Job description is required'),
  body('hiringManager').optional().isString().trim()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const newJob = {
    id: Math.max(...jobs.map(j => j.id)) + 1,
    ...req.body,
    postedDate: new Date().toISOString().split('T')[0],
    status: 'open',
    applicantCount: 0
  };

  jobs.push(newJob);
  res.status(201).json(newJob);
});

/**
 * @swagger
 * /api/v1/jobs/{id}:
 *   put:
 *     summary: Update job posting
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Job ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Job'
 *     responses:
 *       200:
 *         description: Job updated successfully
 *       404:
 *         description: Job not found
 */
router.put('/:id', [
  param('id').isInt({ min: 1 }),
  body('title').optional().notEmpty(),
  body('type').optional().isIn(['full-time', 'part-time', 'contract', 'internship']),
  body('level').optional().isIn(['entry', 'junior', 'mid', 'senior', 'executive']),
  body('status').optional().isIn(['open', 'closed', 'on_hold'])
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const jobIndex = jobs.findIndex(j => j.id === parseInt(req.params.id));
  if (jobIndex === -1) {
    return res.status(404).json({ error: 'Job not found' });
  }

  jobs[jobIndex] = { ...jobs[jobIndex], ...req.body };
  res.json(jobs[jobIndex]);
});

/**
 * @swagger
 * /api/v1/jobs/{id}/applications:
 *   get:
 *     summary: Get applications for a job
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Job ID
 *     responses:
 *       200:
 *         description: List of applications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/JobApplication'
 */
router.get('/:id/applications', [
  param('id').isInt({ min: 1 })
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const jobApplications = applications.filter(app => app.jobId === parseInt(req.params.id));
  res.json({
    applications: jobApplications,
    total: jobApplications.length
  });
});

/**
 * @swagger
 * /api/v1/jobs/{id}/applications:
 *   post:
 *     summary: Submit job application
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Job ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/JobApplication'
 *     responses:
 *       201:
 *         description: Application submitted successfully
 *       404:
 *         description: Job not found
 */
router.post('/:id/applications', [
  param('id').isInt({ min: 1 }),
  body('applicantName').notEmpty().withMessage('Applicant name is required'),
  body('applicantEmail').isEmail().withMessage('Valid email is required'),
  body('coverLetter').optional().isString().trim()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const job = jobs.find(j => j.id === parseInt(req.params.id));
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  if (job.status !== 'open') {
    return res.status(400).json({ error: 'This job is no longer accepting applications' });
  }

  const newApplication = {
    id: Math.max(...applications.map(app => app.id)) + 1,
    jobId: parseInt(req.params.id),
    ...req.body,
    applicationDate: new Date().toISOString().split('T')[0],
    status: 'new',
    notes: 'Application received'
  };

  applications.push(newApplication);
  
  // Update applicant count
  const jobIndex = jobs.findIndex(j => j.id === parseInt(req.params.id));
  jobs[jobIndex].applicantCount += 1;

  res.status(201).json(newApplication);
});

module.exports = router;