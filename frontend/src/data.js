export const initialData = {
  books: [
    {id:1,title:"Clean Code",author:"Robert C. Martin",isbn:"978-0132350884",category:"Informatique",total_copies:3,available_copies:2,published_year:2008},
    {id:2,title:"The Pragmatic Programmer",author:"Andrew Hunt",isbn:"978-0201616224",category:"Informatique",total_copies:2,available_copies:1,published_year:1999},
    {id:3,title:"Design Patterns",author:"Gang of Four",isbn:"978-0201633610",category:"Informatique",total_copies:2,available_copies:2,published_year:1994},
    {id:4,title:"Introduction à l'IA",author:"Stuart Russell",isbn:"978-2744073076",category:"Intelligence Artificielle",total_copies:4,available_copies:3,published_year:2021},
    {id:5,title:"Deep Learning",author:"Ian Goodfellow",isbn:"978-0262035613",category:"Intelligence Artificielle",total_copies:3,available_copies:1,published_year:2016},
    {id:6,title:"Python Machine Learning",author:"Sebastian Raschka",isbn:"978-1789955750",category:"Intelligence Artificielle",total_copies:2,available_copies:2,published_year:2019},
  ],
  users: [
    {id:1,name:"Amadou Diallo",email:"amadou@dit.sn",user_type:"Etudiant",student_id:"DIT2024001",phone:"+221771234567",is_active:true},
    {id:2,name:"Fatou Sow",email:"fatou@dit.sn",user_type:"Etudiant",student_id:"DIT2024002",phone:"+221772345678",is_active:true},
    {id:3,name:"Dr. Moussa Traoré",email:"moussa@dit.sn",user_type:"Professeur",phone:"+221773456789",is_active:true},
    {id:4,name:"Aïssatou Ba",email:"aissatou@dit.sn",user_type:"Personnel administratif",phone:"+221774567890",is_active:true},
    {id:5,name:"Ibrahima Ndiaye",email:"ibrahima@dit.sn",user_type:"Etudiant",student_id:"DIT2024003",phone:"+221775678901",is_active:true},
  ],
  loans: [
    {id:1,book_id:1,user_id:1,borrowed_at:"2026-03-10T09:00:00",due_date:"2026-03-24T09:00:00",returned_at:null,status:"active",is_overdue:false,book:{title:"Clean Code",author:"Robert C. Martin"},user:{name:"Amadou Diallo",user_type:"Etudiant"}},
    {id:2,book_id:5,user_id:2,borrowed_at:"2026-03-05T10:00:00",due_date:"2026-03-19T10:00:00",returned_at:null,status:"overdue",is_overdue:true,days_overdue:3,book:{title:"Deep Learning",author:"Ian Goodfellow"},user:{name:"Fatou Sow",user_type:"Etudiant"}},
    {id:3,book_id:2,user_id:3,borrowed_at:"2026-03-08T11:00:00",due_date:"2026-03-22T11:00:00",returned_at:null,status:"active",is_overdue:false,book:{title:"The Pragmatic Programmer",author:"Andrew Hunt"},user:{name:"Dr. Moussa Traoré",user_type:"Professeur"}},
    {id:4,book_id:3,user_id:1,borrowed_at:"2026-02-20T09:00:00",due_date:"2026-03-06T09:00:00",returned_at:"2026-03-04T14:00:00",status:"returned",is_overdue:false,book:{title:"Design Patterns",author:"Gang of Four"},user:{name:"Amadou Diallo",user_type:"Etudiant"}},
  ]
};
