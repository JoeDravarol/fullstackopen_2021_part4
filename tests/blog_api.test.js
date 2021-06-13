const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const Blog = require('../models/blog')
const User = require('../models/user')

const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  // Create test user
  await api
    .post('/api/users')
    .send(helper.testUser)
    .expect(200)

  for (let blog of helper.initialBlogs) {
    let blogObject = new Blog(blog)
    await blogObject.save()
  }
})

describe('when there is initially some blogs saved', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })
  
  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
  
    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('verify blog post unique indentifier property is named id', async () => {
    const response = await api.get('/api/blogs')
    const blogToView = response.body[0]
  
    expect(blogToView.id).toBeDefined()
  })
})

describe('addition of a new blog', () => {
  test('succeeds with valid data', async () => {
    const newBlog = {
      title: 'First class tests',
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
      likes: 10,
    }

    const loginResponse = await api
      .post('/api/login')
      .send(helper.testUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)
    
    const userToken = loginResponse.body.token

    // FAILS with 401 Unauthorized if token is not provided
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${userToken}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
  
    const blogsTitle = blogsAtEnd.map(b => b.title)
    expect(blogsTitle).toContain(newBlog.title)
  })

  test('with likes property missing will default the value to 0', async () => {
    const newBlog = {
      title: 'First class tests',
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    }

    const loginResponse = await api
      .post('/api/login')
      .send(helper.testUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)
    
    const userToken = loginResponse.body.token
  
    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${userToken}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
  
    const blogToView = blogsAtEnd.find(b => b.title === newBlog.title)
    expect(blogToView.likes).toEqual(0)
  })

  test('fails with status code 400 if data is invalid', async () => {
    const invalidBlog = {
      author: 'John Cena',
    }
  
    const loginResponse = await api
      .post('/api/login')
      .send(helper.testUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)
    
    const userToken = loginResponse.body.token

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${userToken}`)
      .send(invalidBlog)
      .expect(400)
      
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })
})

describe('deletion of a blog', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]
  
    const loginResponse = await api
      .post('/api/login')
      .send(helper.testUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)
    
    const userToken = loginResponse.body.token

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(204)
    
    const blogsAtEnd = await helper.blogsInDb()
  
    expect(blogsAtEnd).toHaveLength(
      helper.initialBlogs.length -1
    )
  
    const blogsTitle = blogsAtEnd.map(b => b.title)
  
    expect(blogsTitle).not.toContain(blogToDelete)
  })
})

describe('modification of a blog', () => {
  test('succeeds with status code 200 if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]
  
    const blog = {
      ...blogToUpdate,
      likes: 450
    }
  
    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(blog)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  
    const blogsAtEnd = await helper.blogsInDb()
  
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  
    const updatedBlog = blogsAtEnd.find(blog => blog.id === blogToUpdate.id)
    
    expect(updatedBlog.likes).toBe(450)
  })
})

afterAll(() => {
  mongoose.connection.close()
})