const express = require('express')
const { Router } = express
const Contenedor = require('./contenedor.js')
const app = express()
const productsRouter = Router()
const contenedor = new Contenedor('products.txt')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/api/productos', productsRouter)
app.use('',express.static(__dirname + 'public'))

//HANDLERBARS
const {engine} = require('express-handlebars')
const engienFn = engine({
  extname: '.hbs',
  defaultLayout: `${__dirname}/views/index.hbs`,
  layoutsDir: `${__dirname}/views/layouts`,
  partialsDir: `${__dirname}/views/partials`
})

app.engine('hbs', engienFn)
app.set('views', './views')
app.set('view engine', 'hbs')

// EJS
/* app.set('views','./views')
app.set('view engine', 'ejs') */


const PORT = 8080

const server = app.listen(PORT, () => {
  console.log(`Servidor HTTP escuchando en el puerto ${PORT}`)
})

server.on('error', error => console.log(`Error en servidor: ${error}`))



productsRouter.get('', async (req,res) =>{
  const products = await contenedor.getAll()

  const data ={
    products
  }
    //return res.render('products', data) EJS
    return res.render('layouts/products', data)
})

productsRouter.get('/form', async (req,res) =>{
  const products = await contenedor.getAll()
  const data ={
    products
  }
  // return res.render('form', data) EJS
    return res.render('layouts/form', data)
})

productsRouter.get('/:id', async (req,res) =>{
  const id = Number(req.params.id)
  const product = await contenedor.getById(id)
  
if (product === undefined){
  return res.status(404).json({error: 'Producto no encontrado'})
}
  return res.json(product)
})

productsRouter.post('', async (req, res) => {
  const product = {
    title: req.body.title,
    price: req.body.price,
    thumbnail: req.body.thumbnail,
  }
 
  await contenedor.save(product)

  //return res.redirect('/api/productos/form') EJS
   return res.redirect('/api/productos/form')
})

productsRouter.put('/:id', async (req, res)=>{

  const id = (Number(req.params.id))
  const products = await contenedor.getAll()
  const productIndex = products.findIndex(product=> product.id === id)

  if(productIndex === -1){
  return res.status(404).json({error : 'Producto no encontrado'})
  }
  const body = req.body

  products[productIndex].title = body.title
  products[productIndex].price = body.price
  products[productIndex].thumbnail = body.thumbnail 
  
  //cree esta funcion en contenedor.js para actualizar y no perder los id
  await contenedor.update(products[productIndex])
    
  return res.json(products)
})

productsRouter.delete('/:id', async (req,res)=>{
  const id = Number(req.params.id)
  const product = await contenedor.getById(id)
  console.log(product)
  if(product === undefined){
  return res.status(404).json({error: 'Producto no encontrado'})
  }
  await contenedor.deleteById(id)
  return res.json(product)
})



