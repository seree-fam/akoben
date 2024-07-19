![](akoben.svg)
---

The boldest ideas arise when like minded individuals come together to solve a problem with the group's interest in mind. Akoben is a forum that uses Semaphore (https://semaphore.pse.dev/build) to enable users to log into a group and make posts as a part of the group without revealing their individuality.

The goal for the group is to ultimately create something like they cypherpunk mail list (https://nakamotoinstitute.org/library) so that the boldest ideas can be shared with low bias.

Our platform is designed to promote engagement and collaboration among users, with a wide range of community management features that enable users to create, subscribe to, and interact with communities on a variety of topics. We also provide a range of features to make it easy for users to create and view posts, including options for images, voting, and sharing.

In addition, we provide a robust set of user authentication and account management features, ensuring that our users have a seamless and secure experience. Users can sign up using Semaphore Id.

Our platform is also designed to be user-friendly and accessible, with a responsive UI that can be used on smartphones, tablets, or computers. Whether you're an experienced user or just getting started, Akoben has everything you need to engage with others and explore new ideas.


# **Flow**
This workflow demonstrates the features and functionality of the project.

<img width="1000" alt="cover" src="https://github.com/seree-fam/akoben/blob/ee2a18c7617c829233e4dd841acb59c363bcb18d/public/images/workflow.png">



# **Requirements**
These are the requirements needed to run the project:
- Node 18 LTS
- Next.JS 12+
- Firebase V9
- Semaphore
- Bandada


# **Features**
## **Authentication and Account Management**
The system leverages Semaphore ZK proofs to manage user authentication and account management features designed to ensure that users have a seamless and secure experience:
- Users can sign up using Semaphore ID.

## **Privacy Preserving groups** ##
In the realm of privacy and zero-knowledge technologies, the concept of a group takes on a significant role. A group, in this context, is more than just a collection of individuals; it represents an anonymity set. This means that within the group, individual members' actions, characteristics, or identities become indistinguishable from one another, providing a way for individuals to engage in collective actions or share attributes without revealing specific information about themselves.

## **Community**
The system has several key community management features designed to promote engagement and collaboration among users:
- Users can create communities (different types)/ Bandada groups
- Users can subscribe and unsubscribe to and from a community/ bandada invite codes which is signed by Akoben.
- Admins can change or delete the community logo
- Admins can change community visibility
- Users can view and navigate to all public and restricted communities

## **Posts**
The system has several key features designed to make it easy for users to create and view posts within communities:
- Users can create a post in a specific community with an optional image
- Users can view all posts from a community that they been invited to.
- Users can open post to interact with them
- Users can view posts from subscribed communities
- Users can delete a post they have created
- Users can vote on a post
- Users can share a post

## **Comments**
The web application has several key features designed to make it easy for users to engage with others by creating and viewing comments:
- Users can create a comment to reply to a post
- Users can view comments in a post
- Users can delete a comment they created

## **General**
The system has several general features to make the site user-friendly and accessible:
- Logged-in users can view posts from various communities they are subscribed to in the home feed
- System UI is responsive, hence it can be used on smartphones, tablets, or computers

# **Stack**
These are the main technologies that were used in this project:

## **Front-End**
- [**TypeScript**](https://www.typescriptlang.org/): TypeScript is a superset of JavaScript that adds optional static typing and other features to make the development of large-scale JavaScript applications easier and more efficient. TypeScript enables developers to catch errors earlier in the development process, write more maintainable code, and benefit from advanced editor support.
- [**Next.js**](https://nextjs.org/): Next.js is a popular React framework for building server-side rendered (SSR) and statically generated web applications. It provides a set of tools and conventions that make it easy to build modern, performant web applications that can be easily deployed to a variety of hosting environments.
- [**Recoil State Manager**](https://recoiljs.org/): Recoil is a state management library for React applications that provides a simple, flexible, and efficient way to manage shared state in your app. Recoil is designed to work seamlessly with React and is particularly well-suited for complex or large-scale applications.
- [**Chakra UI**](https://chakra-ui.com/): Chakra UI is a popular React component library that provides a set of customizable, accessible, and responsive UI components for building web applications. Chakra UI is built with accessibility in mind and provides a range of pre-built components that can be easily customized to fit your app's design and branding.


## **Back-End**
- [**Firebase**](https://firebase.google.com/): Firebase is a mobile and web application development platform that provides a range of tools and services to help developers build high-quality apps quickly and easily. Firebase offers features such as real-time database, cloud storage, authentication, hosting, and more, all of which can be easily integrated into your Next.js app.

- [**Semaphore**](https://semaphore.pse.dev/): Semaphore is a protocol for Web2 and Web3. It integrates into any front-end framework or pure HTML/CSS/JS. It is cross-chain compatible with EVM, L2s, and alt-blockchains. It  leverages Zero Knowledge, allowing us to verify information without revealing any underlying data. This powerful primitive allows one to prove membership and signal anonymously.

- [**Bandada**](https://bandada.pse.dev/): Bandada is an infractructure to manage privacy-preserving groups. The groups can be managed using the Dashboard or the REST API endpoints or the API SDK library.

- [**Circom**]()

## 1. **Clone the Project Locally**
```sh
git clone https://github.com/seree-fam/akoben.git
```

## 2. **Set Up Environment**
1. Copy the `.env.example` file and call it `.env.local`
2. Populate the `.env.local` with the required Firebase secrets 

## 3. **Set Up Firebase**
### **Set Up Cloud Functions**
1. **Install Firebase tools**
```sh
npm install -g firebase-tools
```

2. **Initialise Firebase project**
```sh
firebase init
```

3. **Deploy cloud functions**
```sh
firebase deploy --only functions
```

### **Set Up Firestore Indexing**
Set the following indexes in the `Firestore Database` under the `Indexes` section. 
These are required for querying.

| Collection ID | Fields Indexed                                                     |
| ------------- | ------------------------------------------------------------------ |
| `posts`       | `communityId` Ascending `createdAt` Descending __name__ Descending |
| `comments`    | `postId` Ascending `createdAt` Descending __name__ Descending      |

## 3. **Run Project**
```sh
npm run dev
```
This should run the project on `localhost:3000`

# **Running via Docker**
You can build and run the application through Docker. This requires the `.env.local` file to be completed, refer to 
installation instructions in the [Wiki](https://github.com/mbeps/next_discussion_platform/wiki/3.-Installation#step-32-obtain-firebase-secrets-and-add-them-to-the-envlocal-file) for setting it up.

Once everything is ready, use the command bellow to run the application. 
```sh
docker-compose -f docker/docker-compose.yml up --build
```

