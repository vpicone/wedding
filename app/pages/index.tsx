import { request } from "graphql-request";
import useSWR from "swr";

function Profile() {
  const uri = `/admin/api`;

  const { data, error } = useSWR(
    `{
      allTodos {
        name
      }
    }`,
    query => request(uri, query)
  );

  if (error) return <div>failed to load</div>;
  if (!data) return <div>loading...</div>;
  return (
    <div>
      todosx:{" "}
      <ul>
        {data.allTodos.map((todo: any) => (
          <li>{todo.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default Profile;
