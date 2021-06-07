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
  const authorsInfo = _.map(authorsBlogCountObj, (blogs, author) => 
    ({ author, blogs })
  )

  return _.maxBy(authorsInfo, 'blogs')
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) return null

  const authorTotalLikesReducer = (result, blog) => {
    if ( !result.hasOwnProperty(blog.author) ) {
      result[blog.author] = blog.likes
    } else {
      result[blog.author] += blog.likes
    }
    
    return result
  }

  // { 'Edsger W. Dijkstra': 17 }
  const authorsLikesCountObj = _.reduce(blogs, authorTotalLikesReducer, {})
  const authorsInfo = _.map(authorsLikesCountObj, (likes, author) => 
    ({ author, likes })
  )
  return _.maxBy(authorsInfo, 'likes')
}

module.exports = {
  dummy,
  totalLikes,
  favouriteBlog,
  mostBlogs,
  mostLikes
}