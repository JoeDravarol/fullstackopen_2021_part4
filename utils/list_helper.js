const _ = require('lodash')

const dummy = () => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((acc, blog) => {
    return acc += blog.likes
  }, 0)
}

const favouriteBlog = (blogs) => {

  return blogs.reduce((favourite, blog) => {
    return favourite.likes > blog.likes
      ? favourite
      : blog
  }, {})
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) return null

  // { 'Robert C. Martin': 3 }
  const authorsBlogCountObj = _.countBy(blogs, 'author')
  // [ ['Robert C. Martin', 3] ]
  const authorsBlogCountArr = _.toPairs(authorsBlogCountObj)
  const authorsInfo = _.map(authorsBlogCountArr, ([authorName, totalBlogs]) => {
    return { 
      author: authorName,
      blogs: totalBlogs 
    }
  })

  return _.maxBy(authorsInfo, 'blogs')
}

module.exports = {
  dummy,
  totalLikes,
  favouriteBlog,
  mostBlogs,
}