const admin = require('firebase-admin');

// Path to your service account key
const serviceAccount = require('./config/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const firestore = admin.firestore();

const posts = [
  {
    id: '1',
    title: 'First Post',
    content: 'This is the content of the first post.',
    communityId: 'community1',
    voteStatus: 10,
    creatorId: 'user1',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    id: '2',
    title: 'Second Post',
    content: 'This is the content of the second post.',
    communityId: 'community2',
    voteStatus: 5,
    creatorId: 'user2',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  // Add more posts as needed
];

const populatePosts = async () => {
  const batch = firestore.batch();

  posts.forEach((post) => {
    const postRef = firestore.collection('posts').doc(post.id);
    batch.set(postRef, post);
  });

  try {
    await batch.commit();
    console.log('Posts added successfully');
  } catch (error) {
    console.error('Error adding posts: ', error);
  }
};

populatePosts();
