# Message Board Forum

This project is an online forum designed with a UI similar to Reddit. The forum can be accessed [here](https://roereresupabaseforum.netlify.app/).

Users are able to post, comment and upvote other posts.

The data is stored in a dedicated PostgreSQL database.

![image](https://github.com/RoeReRe/supabase-forum/assets/119654395/c5da230d-77e3-4f30-83b2-e097c6a5f83d)

## Features

### Login / Sign up

Users can login through:

* Email
* Google
* Discord

### Post / Comment

Users can post and comment on other posts. They are displayed in a model similar to Reddit.

### Upvote

Users can upvote and downvote posts. Downvoted posts are pushed down the forum.

## Technical Stack

The main dependencies used to build this project are:

1. React (ViteJS)
2. TailwindCSS
3. Supabase

## Acknowledgements

The test units for this project are based on a similar project by [Fireship](https://github.com/fireship-io). While they are decently comprehensive, their implementations are rigid and unscalable. I would recommend redesigning the whole suite for further developments.

Nonetheless, they suffice for the current state of this project.
