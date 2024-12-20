// CONTROLLER OF ERROR
const get404 = (req, res, next) => {
    res.status(404).render('404', {
        pageTitle: 'Page not found',
        path: '/404',
        isAuthenticated: req.isLoggedIn,
    })
}

module.exports = {
    get404,
}