const KEYS = {
  MENU: "bc_menu",
  CART: "bc_cart",
  BILLS: "bc_bills"
};

/* DEFAULT MENU */
function ensureMenu() {
  let items = JSON.parse(localStorage.getItem(KEYS.MENU));
  if (!items || !items.length) {
    items = [
      {id:"1",name:"Tea",price:10,img:"https://www.shutterstock.com/image-photo/fresh-milk-masala-tea-indian-600nw-2498823945.jpg"},
      {id:"2",name:"Black Tea",price:10,img:"https://t4.ftcdn.net/jpg/02/46/60/85/360_F_246608569_wIP1X3lZdcG8GUr3WpYFdee4QR75QjND.jpg"},
      {id:"3",name:"Lemon Tea",price:20,img:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHZrclEYI9T4K3uYIg7yMoFwxQO4rWtndSCA&s"},
      {id:"4",name:"masala Tea",price:20,img:"https://media.istockphoto.com/id/629795068/photo/masala-chai-with-different-ingredients.jpg?s=612x612&w=0&k=20&c=5qTKxLNLlWDCAW91QZP-ekk-rKUA54erokKD1jf0jGk="},
      {id:"5",name:"Cardamom Tea",price:20,img:"https://thumbs.dreamstime.com/b/cup-healthy-ayurvedic-masala-tea-coffee-milk-aromatic-spices-cinnamon-sticks-cardamom-cloves-anise-stars-table-173736120.jpg"},
      {id:"6",name:"Honey Tea",price:30,img:"https://t3.ftcdn.net/jpg/12/92/50/78/360_F_1292507805_8jKZNO6gxyw3bXZlB85UqY7bpwRAB266.jpg"},
      {id:"7",name:"Honey lemon Tea",price:35,img:"https://media.istockphoto.com/id/1142669969/photo/a-glass-cup-of-tea-with-lemon-mint-and-ginger.jpg?s=612x612&w=0&k=20&c=DpFoWpAtDtup_Kaza8FbW_TOR1zDJZY-2HJ5gZzRRmw="}
    ];
    localStorage.setItem(KEYS.MENU, JSON.stringify(items));
  }
}
ensureMenu();

const $ = s => document.querySelector(s);
const load = k => JSON.parse(localStorage.getItem(k)) || [];
const save = (k,v) => localStorage.setItem(k, JSON.stringify(v));

/* MENU */
function renderMenu() {
  const grid = $("#menu-grid");
  grid.innerHTML = "";
  load(KEYS.MENU).forEach(i=>{
    const d=document.createElement("div");
    d.className="menu-item";
    d.innerHTML=`
      <img src="${i.img}">
      <h4>${i.name}</h4>
      <p>₹${i.price}</p>
      <button>Add</button>`;
    d.querySelector("button").onclick=()=>addToCart(i.id);
    grid.appendChild(d);
  });
}

/* CART */
function addToCart(id){
  const cart=load(KEYS.CART);
  const item=load(KEYS.MENU).find(i=>i.id===id);
  const f=cart.find(i=>i.id===id);
  f?f.qty++:cart.push({...item,qty:1});
  save(KEYS.CART,cart);
  renderCart();
}

function renderCart(){
  const cart=load(KEYS.CART);
  const box=$("#cart-items");
  box.innerHTML="";
  let total=0;
  cart.forEach(i=>{
    total+=i.price*i.qty;
    box.innerHTML+=`<div>${i.name} x ${i.qty}<span>₹${i.price*i.qty}</span></div>`;
  });
  $("#total").textContent=total.toFixed(2);
  $("#cart-count").textContent=cart.reduce((s,i)=>s+i.qty,0);
}

/* MANAGE CRUD */
function renderManage(){
  const list = $("#manage-list");
  list.innerHTML = "";

  load(KEYS.MENU).forEach(i=>{
    const d = document.createElement("div");
    d.className = "manage-item";
    d.innerHTML = `
      <span>${i.name} - ₹${i.price}</span>
      <div class="manage-actions">
        <button onclick="editItem('${i.id}')">Edit</button>
        <button class="delete" onclick="deleteItem('${i.id}')">Delete</button>
      </div>
    `;
    list.appendChild(d);
  });

  renderMonthlyTotal();
}


function editItem(id){
  const i=load(KEYS.MENU).find(x=>x.id===id);
  $("#edit-id").value=i.id;
  $("#item-name").value=i.name;
  $("#item-price").value=i.price;
  $("#item-img").value=i.img;
}

function deleteItem(id){
  save(KEYS.MENU, load(KEYS.MENU).filter(i=>i.id!==id));
  renderMenu(); renderManage();
}

$("#manage-form").onsubmit=e=>{
  e.preventDefault();
  const id=$("#edit-id").value||Date.now()+"";
  const items=load(KEYS.MENU);
  const f=items.find(i=>i.id===id);
  if(f){
    f.name=$("#item-name").value;
    f.price=+$("#item-price").value;
    f.img=$("#item-img").value;
  }else{
    items.push({id,name:$("#item-name").value,price:+$("#item-price").value,img:$("#item-img").value});
  }
  save(KEYS.MENU,items);
  resetForm(); renderMenu(); renderManage();
};

function resetForm(){
  $("#manage-form").reset();
  $("#edit-id").value="";
}

/* BILLS + MONTHLY TOTAL */
function saveBill(total){
  const bills=load(KEYS.BILLS);
  bills.push({total,date:new Date()});
  save(KEYS.BILLS,bills);
}

function renderMonthlyTotal(){
  const m=new Date().getMonth();
  const y=new Date().getFullYear();
  const sum=load(KEYS.BILLS)
    .filter(b=>new Date(b.date).getMonth()==m && new Date(b.date).getFullYear()==y)
    .reduce((s,b)=>s+b.total,0);
  $("#monthly-total").textContent=sum.toFixed(2);
}

/* PRINT */
function printBill(){
  let t=$("#total").textContent;
  if(t==0) return alert("Cart empty");
  window.print();
}

/* NAV */
document.querySelectorAll(".nav-btn").forEach(b=>{
  b.onclick=()=>{
    document.querySelectorAll(".nav-btn").forEach(x=>x.classList.remove("active"));
    b.classList.add("active");
    document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
    $("#"+b.dataset.page+"-page").classList.add("active");
  };
});

/* PAYMENT */
$("#pay-now-btn").onclick=()=>{
  $("#payment-total").textContent=$("#total").textContent;
  $("#payment-modal").style.display="flex";
};
$(".close").onclick=()=>$("#payment-modal").style.display="none";
$("#confirm-payment").onclick=()=>{
  saveBill(+$("#total").textContent);
  save(KEYS.CART,[]);
  renderCart();
  $("#payment-modal").style.display="none";
};

renderMenu(); renderCart(); renderManage();
