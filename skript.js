const products = [
  {
    id: 1,
    title: "Abduvohid Ne'matov",
    category: "25 yosh",
    price: 1.2,
    rating: 73,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Abduvohid_Nematov_%28cropped%29.jpg/250px-Abduvohid_Nematov_%28cropped%29.jpg",
    isNew: true,
  },
  {
    id: 2,
    title: "Abduqodir Husanov",
    category: "22 yosh",
    price: 50.0,
    rating: 81,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpNdIt3FIYJuEEIbv5gCGPFQTLg7ZCv1IVMlnVrI-ybe5CagljzjagBIU&s=10",
    isNew: false,
  },
  {
    id: 3,
    title: "Rustam Ashurmatov",
    category: "29 yosh",
    price: 1.0,
    rating: 71,
    image: "https://cdn.uza.uz/2026/03/31/09/59/BM7plfeOp6834xIBLJL09Y8XkdUPZMB9_normal.jpg",
    isNew: true,
  },
  {
    id: 4,
    title: "Abdulla Abdullayev",
    category: "29 yosh",
    price: 1.0,
    rating: 69,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSkbuZF8K3uHDR_4MYpJuawMC--4FgQ-elWhYZMCDp57g&s=10",
    isNew: false,
  },
  {
    id: 5,
    title: "Sherzot Nasrullayev",
    category: "27 yosh",
    price: 1.0,
    rating: 72,
    image: "https://cdn.pfl.uz/player/a07d5e72-07ef-4622-8bc8-0e075393a526-bd729e14-7aaf-4c2c-87c8-b45cef8b86c3.png",
    isNew: true,
  },
  {
    id: 6,
    title: "Behruz Karimov",
    category: "19 yosh",
    price: 1.0,
    rating: 66,
    image: "https://zamin.uz/uploads/posts/2026-06/70de26b223_image.webp ",
    isNew: false,
  },
  {
    id: 7,
    title: "Otabek Shukurov",
    category: "30 yosh",
    price: 2.5,
    rating: 74,
    image: "https://nuz.uz/uploads/posts/2020-03/1585415323_photo_2020-03-28_21-22-09.jpg",
    isNew: false,
  },
  {
    id: 8,
    title: "Odiljon Hamrobekov",
    category: "30 yosh",
    price: 1.2,
    rating: 72,
    image: "https://media.gettyimages.com/id/2281297324/photo/atlanta-georgia-odiljon-xamrobekov-of-uzbekistan-poses-for-a-portrait-during-the-official.jpg?s=612x612&w=gi&k=20&c=RTa5nvE8zW-T2gixrk93ULJzAUGV1moQ5Oji5E8tmWA=",
    isNew: true,
  },
  {
    id: 9,
    title: "Abbosbek fayzullayev",
    category: "22 yosh",
    price: 7.0,
    rating: 76,
    image: "https://olympic.uz/storage/uploads/video_materials/545d0966e73ff5059f0f8774d8f65a30.jpg",
    isNew: false,
  },
  {
    id: 10,
    title: "Azizjon G'aniyev",
    category: "28 yosh",
    price: 1.5,
    rating: 71,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ1ZSEeCLRT9esLJZ-3O_pawdYRIb6E_I4RZzBgu9M5qU1iKardlXzWsZI&s=10",
    isNew: true,
  },
  {
    id: 11,
    title: "Eldor Shomurodov (K)",
    category: "30 yosh",
    price: 5.0,
    rating: 76,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnKO0Mhv8fltYvCrofal95oXQJqhoIIjTfvgTErW8O8ZLHT_Usx8f5r54&s=10",
    isNew: false,
  },
];

const cardList = document.getElementById('card-list');

products.forEach((item) => {
  const card = document.createElement('div');

  card.innerHTML = `
    <div class="h-70 overflow-hidden">
      <img class='object-cover w-full h-full' src="${item.image}" alt="${item.title}">
    </div>

    <div>
      <h2 class="text-lg font-bold py-2">${item.title}</h2>
      <div>
        ⭐️⭐️⭐️⭐️⭐️ (${item.rating})
      </div>
      <div class='py-2 flex gap-3 items-center'>
        <span class='text-xl font-bold'>${item.price} milion Evro</span>
      </div>
    </div>
  `
  cardList.appendChild(card);
})