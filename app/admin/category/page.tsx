


import CategoryClient from "./category-client";
import getCurrentUser from "@/actions/get-current-user";
import NullData from "@/app/components/null-data";
import getCategories from "@/app/actions/get-categories";
import Container from "@/app/components/container";


export default async function CategoryPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "ADMIN") {
    return <NullData title="Oops! Access denied" />;
  }
  // Pass empty array, let CategoryClient fetch from API route
  return (
    <div className="pt-8">
      <Container>
        <CategoryClient categories={[]} />
      </Container>
    </div>
  );
}
