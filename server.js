const http = require('http')
const https = require('https')

const express = require('express')
const url = require('url')
const bodyParser = require('body-parser')
const nunjucks = require('nunjucks')

const app = express()

app.use(bodyParser.json())
const asset = __dirname + '/static'
app.use('/static', express.static(asset))

nunjucks.configure('templates', {
    autoescape: true,
    express: app,
    noCache: true,
})

const log = console.log.bind(console)

const clientByProtocol = (protocol) => {
    if (protocol === 'http:') {
        return http
    } else {
        return https
    }
}

const apiOptions = () => {
    const envServer = process.env.apiServer
    const defaultServer = 'http://127.0.0.1:4000'
    const server = envServer || defaultServer
    const result = url.parse(server)
    const obj = {
        headers: {
            'Content-Type': 'application/json',
        },
        rejectUnauthorized: false,
    }
    const options = Object.assign({}, obj, result)

    if (options.href.length > 0) {
        delete options.href
    }
    return options
}

const httpOptions = (request) => {
    const baseOptions = apiOptions()
    const pathOptions = {
        path: request.originalUrl,
    }
    const options = Object.assign({}, baseOptions, pathOptions)
    Object.keys(request.headers).forEach((k) => {
        options.headers[k] = request.headers[k]
    })
    options.method = request.method
    return options
}

app.get('/', (request, response) => {
    response.render('index.html')
})

app.all('/api/*', (request, response) => {
    const options = httpOptions(request)
    log('request options', options)
    const client = clientByProtocol(options.protocol)
    const r = client.request(options, (res) => {
        response.status(res.statusCode)
        log('debug res', res.headers, res.statusCode)
        Object.keys(res.headers).forEach((k) => {
            const v = res.headers[k]
            response.setHeader(k, v)
        })

        res.on('data', (data) => {
            log('debug data', data.toString('utf8'))
            response.write(data)
        })

        res.on('end', () => {
            log('debug end')
            response.end()
        })

        res.on('error', () => {
            console.error(`error to request: ${request.url}`)
        })
    })

    r.on('error', (error) => {
        console.error(`请求 api server 遇到问题: ${request.url}`, error)
    })

    log('debug options method', options.method)
    if (options.method !== 'GET') {
        const body = JSON.stringify(request.body)
        log('debug body', body, typeof body)
        r.write(body)
    }

    r.end()
})

const run = (port=3000, host='') => {
    const server = app.listen(port, host, () => {
        const address = server.address()
        host = address.address
        port = address.port
        log(`server started at http://${host}:${port}`)
    })
}

if (require.main === module) {
    const port = 3300
    const host = '0.0.0.0'
    run(port, host)
}