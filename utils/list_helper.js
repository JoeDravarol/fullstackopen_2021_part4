const dummy = (blogs) => {
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

module.exports = {
  dummy,
  totalLikes,
  favouriteBlog
}