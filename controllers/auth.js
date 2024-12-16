exports.getLogin = (req, res, next) => {
    const isLoggedIn = req.get('Cookie').split(';')[0].trim().split('=')[1]
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        layout: 'main-layout',
        isAuthenticated: isLoggedIn,
    })
}

exports.postLogin = (req, res, next) => {
    res.setHeader('Set-Cookie', 'loggedin=true')
    res.redirect('/')
}