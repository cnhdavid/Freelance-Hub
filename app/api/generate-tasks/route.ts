import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const generateTasksSchema = z.object({
  projectDescription: z.string().min(10, 'Project description must be at least 10 characters'),
  projectType: z.enum(['web-development', 'mobile-app', 'consulting', 'design', 'other']),
  complexity: z.enum(['simple', 'medium', 'complex']),
  timeline: z.enum(['short', 'medium', 'long']),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Guest Mode: Allow task generation without authentication
    // Tasks won't be saved to database for guests
    const isGuest = !session

    const body = await request.json()
    const validatedData = generateTasksSchema.parse(body)

    // AI Task Generation Logic
    // This is a skeleton that would integrate with an LLM API like Google Gemini
    const generatedTasks = generateTaskSuggestions(validatedData)

    return NextResponse.json({
      success: true,
      tasks: generatedTasks,
      metadata: {
        projectType: validatedData.projectType,
        complexity: validatedData.complexity,
        estimatedDuration: calculateEstimatedDuration(validatedData),
        isGuest,
        message: isGuest ? 'Sign in to save these tasks to your projects' : undefined,
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error generating tasks:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateTaskSuggestions(data: z.infer<typeof generateTasksSchema>) {
  // This is a mock implementation
  // In a real scenario, you would call an LLM API here
  
  const baseTasks = {
    'web-development': {
      simple: [
        { title: 'Setup project repository', estimatedHours: 2, priority: 'high' },
        { title: 'Create basic HTML structure', estimatedHours: 4, priority: 'high' },
        { title: 'Implement responsive CSS', estimatedHours: 8, priority: 'medium' },
        { title: 'Add basic JavaScript functionality', estimatedHours: 6, priority: 'medium' },
        { title: 'Testing and bug fixes', estimatedHours: 4, priority: 'low' },
      ],
      medium: [
        { title: 'Setup development environment', estimatedHours: 4, priority: 'high' },
        { title: 'Design database schema', estimatedHours: 6, priority: 'high' },
        { title: 'Implement backend API', estimatedHours: 16, priority: 'high' },
        { title: 'Build frontend components', estimatedHours: 20, priority: 'medium' },
        { title: 'Integrate frontend with backend', estimatedHours: 8, priority: 'medium' },
        { title: 'Implement authentication', estimatedHours: 6, priority: 'medium' },
        { title: 'Add payment processing', estimatedHours: 10, priority: 'low' },
        { title: 'Testing and deployment', estimatedHours: 8, priority: 'low' },
      ],
      complex: [
        { title: 'Architecture planning', estimatedHours: 8, priority: 'high' },
        { title: 'Setup microservices infrastructure', estimatedHours: 20, priority: 'high' },
        { title: 'Implement core business logic', estimatedHours: 40, priority: 'high' },
        { title: 'Build admin dashboard', estimatedHours: 24, priority: 'medium' },
        { title: 'Implement real-time features', estimatedHours: 16, priority: 'medium' },
        { title: 'Add analytics and reporting', estimatedHours: 12, priority: 'medium' },
        { title: 'Implement caching strategy', estimatedHours: 8, priority: 'low' },
        { title: 'Security audit and hardening', estimatedHours: 16, priority: 'low' },
        { title: 'Performance optimization', estimatedHours: 12, priority: 'low' },
        { title: 'Documentation and deployment', estimatedHours: 16, priority: 'low' },
      ],
    },
    'mobile-app': {
      simple: [
        { title: 'Setup development environment', estimatedHours: 4, priority: 'high' },
        { title: 'Design app wireframes', estimatedHours: 6, priority: 'high' },
        { title: 'Implement core screens', estimatedHours: 12, priority: 'medium' },
        { title: 'Add navigation', estimatedHours: 4, priority: 'medium' },
        { title: 'Testing and debugging', estimatedHours: 6, priority: 'low' },
      ],
      medium: [
        { title: 'Setup React Native/Flutter project', estimatedHours: 6, priority: 'high' },
        { title: 'Design UI/UX mockups', estimatedHours: 12, priority: 'high' },
        { title: 'Implement authentication', estimatedHours: 8, priority: 'high' },
        { title: 'Build core features', estimatedHours: 24, priority: 'medium' },
        { title: 'Integrate with backend API', estimatedHours: 12, priority: 'medium' },
        { title: 'Add push notifications', estimatedHours: 6, priority: 'medium' },
        { title: 'Offline functionality', estimatedHours: 8, priority: 'low' },
        { title: 'App store submission', estimatedHours: 4, priority: 'low' },
      ],
      complex: [
        { title: 'Technical architecture design', estimatedHours: 12, priority: 'high' },
        { title: 'Setup CI/CD pipeline', estimatedHours: 16, priority: 'high' },
        { title: 'Implement advanced features', estimatedHours: 40, priority: 'high' },
        { title: 'Real-time synchronization', estimatedHours: 20, priority: 'medium' },
        { title: 'Advanced animations', estimatedHours: 16, priority: 'medium' },
        { title: 'Background processing', estimatedHours: 12, priority: 'medium' },
        { title: 'Security implementation', estimatedHours: 16, priority: 'low' },
        { title: 'Performance optimization', estimatedHours: 12, priority: 'low' },
        { title: 'Multi-platform deployment', estimatedHours: 8, priority: 'low' },
      ],
    },
    'consulting': {
      simple: [
        { title: 'Initial client consultation', estimatedHours: 2, priority: 'high' },
        { title: 'Requirements gathering', estimatedHours: 4, priority: 'high' },
        { title: 'Analysis and recommendations', estimatedHours: 6, priority: 'medium' },
        { title: 'Report preparation', estimatedHours: 4, priority: 'medium' },
        { title: 'Follow-up meeting', estimatedHours: 2, priority: 'low' },
      ],
      medium: [
        { title: 'Discovery phase', estimatedHours: 8, priority: 'high' },
        { title: 'Stakeholder interviews', estimatedHours: 12, priority: 'high' },
        { title: 'Process analysis', estimatedHours: 16, priority: 'medium' },
        { title: 'Solution design', estimatedHours: 12, priority: 'medium' },
        { title: 'Implementation planning', estimatedHours: 8, priority: 'medium' },
        { title: 'Training sessions', estimatedHours: 6, priority: 'low' },
        { title: 'Documentation', estimatedHours: 4, priority: 'low' },
      ],
      complex: [
        { title: 'Comprehensive audit', estimatedHours: 20, priority: 'high' },
        { title: 'Market research', estimatedHours: 16, priority: 'high' },
        { title: 'Strategic planning', estimatedHours: 24, priority: 'high' },
        { title: 'Change management', estimatedHours: 16, priority: 'medium' },
        { title: 'Team training', estimatedHours: 12, priority: 'medium' },
        { title: 'Performance metrics setup', estimatedHours: 8, priority: 'medium' },
        { title: 'Long-term roadmap', estimatedHours: 12, priority: 'low' },
        { title: 'Success measurement', estimatedHours: 4, priority: 'low' },
      ],
    },
    'design': {
      simple: [
        { title: 'Design brief analysis', estimatedHours: 2, priority: 'high' },
        { title: 'Mood board creation', estimatedHours: 4, priority: 'high' },
        { title: 'Initial sketches', estimatedHours: 6, priority: 'medium' },
        { title: 'Digital mockups', estimatedHours: 8, priority: 'medium' },
        { title: 'Final revisions', estimatedHours: 4, priority: 'low' },
      ],
      medium: [
        { title: 'Research and discovery', estimatedHours: 6, priority: 'high' },
        { title: 'User persona creation', estimatedHours: 8, priority: 'high' },
        { title: 'Wireframing', estimatedHours: 12, priority: 'medium' },
        { title: 'High-fidelity designs', estimatedHours: 20, priority: 'medium' },
        { title: 'Prototyping', estimatedHours: 8, priority: 'medium' },
        { title: 'Design system creation', estimatedHours: 12, priority: 'low' },
        { title: 'Asset preparation', estimatedHours: 4, priority: 'low' },
      ],
      complex: [
        { title: 'Comprehensive research', estimatedHours: 12, priority: 'high' },
        { title: 'User journey mapping', estimatedHours: 16, priority: 'high' },
        { title: 'Information architecture', estimatedHours: 12, priority: 'high' },
        { title: 'Interaction design', estimatedHours: 20, priority: 'medium' },
        { title: 'Visual design system', estimatedHours: 24, priority: 'medium' },
        { title: 'Animation design', estimatedHours: 12, priority: 'medium' },
        { title: 'Accessibility compliance', estimatedHours: 8, priority: 'low' },
        { title: 'Cross-platform adaptation', estimatedHours: 8, priority: 'low' },
      ],
    },
  }

  const defaultTasks = [
    { title: 'Project kickoff meeting', estimatedHours: 2, priority: 'high' },
    { title: 'Requirements documentation', estimatedHours: 4, priority: 'high' },
    { title: 'Project planning', estimatedHours: 6, priority: 'medium' },
    { title: 'Regular progress updates', estimatedHours: 8, priority: 'medium' },
    { title: 'Final delivery', estimatedHours: 4, priority: 'low' },
  ]

  const projectTasks = data.projectType === 'other' 
    ? defaultTasks 
    : baseTasks[data.projectType]?.[data.complexity] || defaultTasks

  // Adjust tasks based on timeline
  return projectTasks.map((task: { title: string; estimatedHours: number; priority: string }) => ({
    ...task,
    estimatedHours: Math.round(task.estimatedHours * getTimelineMultiplier(data.timeline)),
    category: categorizeTask(task.title),
    dependencies: getTaskDependencies(task.title, projectTasks),
  }))
}

function getTimelineMultiplier(timeline: string): number {
  switch (timeline) {
    case 'short': return 0.7
    case 'medium': return 1.0
    case 'long': return 1.5
    default: return 1.0
  }
}

function categorizeTask(title: string): string {
  if (title.toLowerCase().includes('setup') || title.toLowerCase().includes('environment')) {
    return 'Setup'
  }
  if (title.toLowerCase().includes('design') || title.toLowerCase().includes('ui')) {
    return 'Design'
  }
  if (title.toLowerCase().includes('develop') || title.toLowerCase().includes('implement')) {
    return 'Development'
  }
  if (title.toLowerCase().includes('test') || title.toLowerCase().includes('debug')) {
    return 'Testing'
  }
  if (title.toLowerCase().includes('deploy') || title.toLowerCase().includes('release')) {
    return 'Deployment'
  }
  return 'General'
}

function getTaskDependencies(currentTitle: string, allTasks: any[]): string[] {
  // Simple dependency logic - in a real implementation, this would be more sophisticated
  const dependencies: string[] = []
  
  if (currentTitle.toLowerCase().includes('implement') || currentTitle.toLowerCase().includes('build')) {
    const setupTask = allTasks.find(t => 
      t.title.toLowerCase().includes('setup') || 
      t.title.toLowerCase().includes('environment')
    )
    if (setupTask) dependencies.push(setupTask.title)
  }
  
  if (currentTitle.toLowerCase().includes('test') || currentTitle.toLowerCase().includes('deploy')) {
    const devTasks = allTasks.filter(t => 
      t.title.toLowerCase().includes('implement') || 
      t.title.toLowerCase().includes('build')
    )
    dependencies.push(...devTasks.map(t => t.title))
  }
  
  return dependencies
}

function calculateEstimatedDuration(data: z.infer<typeof generateTasksSchema>): string {
  const baseDays = {
    'simple': { 'short': '1-2 weeks', 'medium': '2-4 weeks', 'long': '4-6 weeks' },
    'medium': { 'short': '2-4 weeks', 'medium': '4-8 weeks', 'long': '8-12 weeks' },
    'complex': { 'short': '4-6 weeks', 'medium': '8-12 weeks', 'long': '12-20 weeks' },
  }
  
  return baseDays[data.complexity]?.[data.timeline] || '4-8 weeks'
}
