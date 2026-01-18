import Container from "@/app/components/container";
import ProductDetails from "./product-details";
import getSettings from "@/actions/get-settings";
import ListRating from "./list-rating";
import getProductById from "@/actions/get-product-by-id";
import NullData from "@/app/components/null-data";
import AddRating from "./add-rating";
import getCurrentUser from "@/actions/get-current-user";
import type { Metadata } from "next";
export async function generateMetadata({ params }: { params: ItemParams }): Promise<Metadata> {
  const product = await getProductById(params);
  if (!product) {
    return {
      title: "Product Not Found",
      description: "This product does not exist.",
      openGraph: {
        title: "Product Not Found",
        description: "This product does not exist.",
        url: `${process.env.NEXT_PUBLIC_BASE_URL || ''}/product/${params.productId}`,
      },
    };
  }
  let productImage = '';
  if (product.images && product.images.length > 0) {
    let imgObj: any = product.images[0];
    if (typeof imgObj === 'string') {
      try {
        imgObj = JSON.parse(imgObj);
      } catch {
        imgObj = {};
      }
    }
    productImage = imgObj.image || '';
  }
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: productImage ? [productImage] : [],
      url: `${process.env.NEXT_PUBLIC_BASE_URL || ''}/product/${product.id}`,
    },
  };
}

interface ItemParams {
  productId: string;
}

const Product = async ({ params }: { params: ItemParams }) => {
  const product = await getProductById(params);
  const user = await getCurrentUser();
  const settings = await getSettings();

  if (!product)
    return <NullData title="Oops! Product with the give id does not exist." />;

  // Serialize product to ensure all fields are passed to client component
  const serializedProduct = {
    ...product,
    dmc: product.dmc ?? 0,
    reviews: product.reviews.map((review: any) => ({
      ...review,
      createdDate: review.createdDate?.toISOString() ?? new Date().toISOString(),
      user: {
        ...review.user,
        createdAt: review.user.createdAt?.toISOString() ?? new Date().toISOString(),
        updatedAt: review.user.updatedAt?.toISOString() ?? new Date().toISOString(),
      }
    }))
  };

  return (
    <div className="p-8">
      <Container>
        <ProductDetails product={serializedProduct} />
        <div className="flex flex-col-reverse sm:flex-row mt-12 sm:mt-20 gap-4">
          <div className="w-full sm:w-1/2">
            <AddRating product={serializedProduct} user={user as any} />
          </div>
          <div className="sm:w-1/2">
            <ListRating product={serializedProduct} />
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Product;
