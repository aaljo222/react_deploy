import { StarIcon, ShoppingCart, HeartIcon } from "lucide-react";
import { Badge } from "antd";
import CartComponent from "../menus/CartComponent";
import useCustomCart from "../../hooks/useCustomCart";
import useCustomLogin from "../../hooks/useCustomLogin";
import { getOne } from "../../api/productsApi";
import useCustomFav from "../../hooks/useCustomFav";
import { useEffect, useState } from "react";
import ReviewsSection from "../review/ReviewsSection";
import {
  API_SERVER_HOST,
  deleteProductOne,
  putProductOne,
  getProductItemReview,
} from "../../api/reviewApi";

const initState = {
  pno: 0,
  pname: "",
  pdesc: "",
  pprice: 0,
  pqty: 0,
  uploadFileNames: [],
};

const host = API_SERVER_HOST;

const ReadComponent = ({ pno }) => {
  const [product, setProduct] = useState(initState);
  const [fetching, setFetching] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [cartVisible, setCartVisible] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(0);
  const { changeCart, cartItems } = useCustomCart();
  const { loginState } = useCustomLogin();
  const { favItems, changeFav, refreshFav } = useCustomFav();

  // Fetch product details
  useEffect(() => {
    setFetching(true);
    getOne(pno).then((data) => {
      setProduct(data);
      setFetching(false);
    });
  }, [pno]);

  const handleAddToCart = () => {
    if (!selectedQuantity) {
      alert("Please select a quantity.");
      return;
    }

    const existingItem = cartItems.find((item) => item.pno === product.pno);
    if (existingItem) {
      if (
        !window.confirm(
          "This item is already in the cart. Do you want to add it again?"
        )
      )
        return;
    }

    changeCart({
      email: loginState.email,
      pno: product.pno,
      pqty: selectedQuantity + (existingItem?.pqty || 0),
    });

    setCartVisible(true); // Open cart automatically
  };

  const handleAddToFavorites = async () => {
    if (!loginState.email) {
      alert("Please log in to add favorites.");
      return;
    }

    const isAlreadyFavorite = favItems.some((item) => item.pno === product.pno);
    if (isAlreadyFavorite) {
      alert("You already liked this product!");
      return;
    }

    try {
      await changeFav({ email: loginState.email, pno: product.pno });
      alert("Product added to favorites!");
      refreshFav();
    } catch (error) {
      console.error("Failed to add favorite:", error);
      alert("Could not add to favorites. Please try again.");
    }
  };

  return (
    <div className="min-h-screen py-12 px-6 lg:px-32 relative">
      <div className="flex flex-col lg:flex-row lg:space-x-12">
        {/* Left Section: Image Gallery */}
        <div className="lg:w-1/3 flex flex-col items-center space-y-6">
          <div className="w-full h-[650px]">
            <img
              src={`${host}/api/products/view/${product.uploadFileNames[currentImage]}`}
              alt={product.pname}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex space-x-3 overflow-x-auto w-full">
            {product.uploadFileNames.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImage(index)}
                className={`w-20 h-20 overflow-hidden ${
                  currentImage === index ? "ring-2 ring-blue-500" : ""
                }`}
              >
                <img
                  src={`${host}/api/products/view/${image}`}
                  alt={`${product.pname} thumbnail`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Right Section: Product Details */}
        <div className="lg:w-1/2 space-y-6">
          <h1 className="text-4xl font-light text-gray-900">{product.pname}</h1>
          <div className="flex items-center space-x-2">
            {[...Array(5)].map((_, i) => (
              <StarIcon key={i} className="h-5 w-5 text-yellow-400" />
            ))}
            <span className="text-gray-600">(4.8) 24 reviews</span>
          </div>
          <p className="text-2xl text-gray-900">
            ₩{product.pprice.toLocaleString()}
          </p>
          <p className="text-gray-700">{product.pdesc}</p>

          {/* Quantity Selector */}
          <div className="flex items-center space-x-4">
            <label htmlFor="quantity" className="text-gray-700">
              Quantity
            </label>
            <input
              type="number"
              id="quantity"
              min="1"
              max={product.pqty}
              value={selectedQuantity}
              onChange={(e) => setSelectedQuantity(Number(e.target.value))}
              className="border rounded-lg p-2 w-20"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-stone-400 hover:bg-stone-600 text-white py-3 rounded-lg flex items-center justify-center"
            >
              <ShoppingCart className="mr-2" />
              Add to Cart
            </button>
            <button
              onClick={handleAddToFavorites}
              className="flex-1 border text-gray-700 py-3 rounded-lg flex items-center justify-center hover:bg-gray-100"
            >
              <HeartIcon className="mr-2 text-red-500" />
              Add to Favorites
            </button>
          </div>

          {/* Product Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-900">
              Product Details
            </h2>
            <ul className="list-disc list-inside text-gray-700">
              <li>Material: 100% premium silk</li>
              <li>Handcrafted in Seoul, South Korea</li>
              <li>Includes both jeogori (jacket) and chima (skirt)</li>
              <li>Decorative norigae (hanging ornament) included</li>
              <li>Dry clean only</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Cart Toggle Button */}
      <div className="fixed top-24 right-10">
        <Badge count={cartItems.length} offset={[0, 10]}>
          <button
            onClick={() => setCartVisible(!cartVisible)}
            className="bg-stone-400 hover:bg-stone-600 text-white p-3 rounded-full shadow-lg flex items-center justify-center"
          >
            <ShoppingCart className="h-6 w-6" />
          </button>
        </Badge>
      </div>

      {/* Cart Drawer */}
      <div
        className={`fixed top-0 right-0 h-[70%] w-96 bg-white shadow-lg mt-40 p-6 overflow-auto transform ${
          cartVisible ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300`}
      >
        <CartComponent />
      </div>
      {/* Reviews Section */}
      <div className="mt-5">
        <ReviewsSection
          itemNo={pno}
          getItemReview={getProductItemReview}
          putOne={putProductOne}
          deleteOne={deleteProductOne}
        />
      </div>
    </div>
  );
};

export default ReadComponent;
