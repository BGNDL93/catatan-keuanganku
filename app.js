const KEY="catatuang_transactions_v1";
let data=JSON.parse(localStorage.getItem(KEY)||"[]");
const $=id=>document.getElementById(id);
const rupiah=n=>new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(n||0);
const today=()=>new Date().toISOString().slice(0,10);
function save(){localStorage.setItem(KEY,JSON.stringify(data));render()}
function totals(){
 let income=data.filter(x=>x.type==="income").reduce((a,x)=>a+x.amount,0);
 let expense=data.filter(x=>x.type==="expense").reduce((a,x)=>a+x.amount,0);
 let t=today(), m=t.slice(0,7);
 let te=data.filter(x=>x.type==="expense"&&x.date===t).reduce((a,x)=>a+x.amount,0);
 let me=data.filter(x=>x.type==="expense"&&x.date.startsWith(m)).reduce((a,x)=>a+x.amount,0);
 $("balance").textContent=rupiah(income-expense);$("income").textContent=rupiah(income);$("expense").textContent=rupiah(expense);
 $("todayExpense").textContent=rupiah(te);$("monthExpense").textContent=rupiah(me);
}
const icons={"Makan & Minum":"🍜","Transportasi":"🚗","Belanja":"🛍️","Tagihan":"🧾","Kesehatan":"💊","Pendidikan":"📚","Hiburan":"🎮","Rumah Tangga":"🏠","Gaji":"💼","Bonus":"🎁","Lainnya":"📌"};
function render(){
 totals();
 let q=$("search").value.toLowerCase(), f=$("typeFilter").value;
 let arr=[...data].sort((a,b)=>b.date.localeCompare(a.date)||b.id-a.id).filter(x=>(f==="all"||x.type===f)&&(`${x.note} ${x.category}`.toLowerCase().includes(q)));
 $("list").innerHTML=arr.length?arr.map(x=>`<div class="item" data-id="${x.id}"><div class="dot">${icons[x.category]||"📌"}</div><div class="item-main"><strong>${escapeHtml(x.note||x.category)}</strong><span>${escapeHtml(x.category)} • ${formatDate(x.date)}</span></div><div class="item-amount ${x.type}">${x.type==="expense"?"−":"+"}${rupiah(x.amount)}</div></div>`).join(""):`<div class="empty">Belum ada transaksi.<br>Tekan “Tambah Transaksi” untuk mulai.</div>`;
 document.querySelectorAll(".item").forEach(el=>el.onclick=()=>edit(+el.dataset.id));
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function formatDate(d){return new Date(d+"T00:00:00").toLocaleDateString("id-ID",{day:"2-digit",month:"short",year:"numeric"})}
function openModal(id=null){
 $("modal").classList.remove("hidden"); $("form").reset(); $("editId").value=""; $("date").value=today(); $("deleteBtn").classList.add("hidden"); $("modalTitle").textContent="Tambah Transaksi";
 if(id){let x=data.find(a=>a.id===id); if(!x)return; $("editId").value=x.id;$("amount").value=x.amount;$("category").value=x.category;$("note").value=x.note;$("date").value=x.date;document.querySelector(`input[name=type][value="${x.type}"]`).checked=true;$("modalTitle").textContent="Edit Transaksi";$("deleteBtn").classList.remove("hidden")}
}
function closeModal(){$("modal").classList.add("hidden")}
function edit(id){openModal(id)}
$("addBtn").onclick=()=>openModal();$("navAdd").onclick=()=>openModal();$("closeModal").onclick=closeModal;
$("modal").onclick=e=>{if(e.target===$("modal"))closeModal()};
$("form").onsubmit=e=>{e.preventDefault();let id=+$("editId").value;let obj={id:id||Date.now(),type:document.querySelector('input[name=type]:checked').value,amount:+$("amount").value,category:$("category").value,note:$("note").value.trim(),date:$("date").value};if(id)data=data.map(x=>x.id===id?obj:x);else data.push(obj);save();closeModal()};
$("deleteBtn").onclick=()=>{let id=+$("editId").value;if(id&&confirm("Hapus transaksi ini?")){data=data.filter(x=>x.id!==id);save();closeModal()}};
$("search").oninput=render;$("typeFilter").onchange=render;
function exportCSV(){if(!data.length){alert("Belum ada data untuk diekspor.");return}let rows=[["Tanggal","Jenis","Kategori","Catatan","Jumlah"],...data.map(x=>[x.date,x.type==="expense"?"Pengeluaran":"Pemasukan",x.category,x.note,x.amount])];let csv=rows.map(r=>r.map(v=>`"${String(v??"").replaceAll('"','""')}"`).join(",")).join("\n");let blob=new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="catatuang-"+today()+".csv";a.click();URL.revokeObjectURL(url)}
$("exportBtn").onclick=exportCSV;$("navExport").onclick=exportCSV;
let deferred;
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferred=e;$("installBtn").classList.remove("hidden")});
$("installBtn").onclick=async()=>{if(deferred){deferred.prompt();deferred=null}};
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js"));
render();