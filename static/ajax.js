var ajax = (method, path, data, callback) => {
    var r = new XMLHttpRequest()
    var host = ''
    path = host + path
    r.open(method, path, true)
    r.setRequestHeader('Content-Type', 'application/json')
    r.onreadystatechange = function() {
        if (r.readyState == 4) {
            callback(r.response)
        }
    }
    r.send(data)
}

var fetch = (url, callback) => {
    ajax('GET', url, '', function(r) {
        console.log('debug raw response', r, r.length)
        var data = JSON.parse(r)
        callback(data)
    })
}

var create = (url, form, callback) => {
    var data = JSON.stringify(form)
    ajax('POST', url, data, function(r) {
        console.log('debug add response', r, r.length)
        var data = JSON.parse(r)
        callback(data)
    })
}

var testFetch = () => {
    var url = '/api/topic/all'
    var response = (r) => {
        var mock = `{"success":true,"data":[{"id":2,"views":48,"title":"node9.0 发布了","content":"nodejs 8.0 去年发布了, 欢迎*来使用*","ct":1496320309557,"ut":1496320309557,"userId":""}],"message":""}`
        var r = JSON.stringify(mock)
        console.log('debug r in mock', r)
    }
    fetch(url, response)
}

var testCreate = () => {
    var url = '/api/topic/add'
    var response = (r) => {
        console.log('create response', r)
    }
    var form = {
        title: 'nodeclub',
        content: 'node11',
    }
    create(url, form, response)
}

var __main = () => {
    testFetch()
    // testCreate()
}

__main()