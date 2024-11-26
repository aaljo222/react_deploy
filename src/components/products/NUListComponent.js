import React, { useEffect, useState } from "react";
import useCustomMove from "../../hooks/useCustomMove";
import FetchingModal from "../common/FetchingModal";
import PageComponent from "../common/PageComponent";
import { Card, CardTitle, CardDescription } from "../ui/Card";
import Button from "../ui/Button";
import { getListNU } from "../../api/nuProductApi";
import "../../Product.css";
import { Input } from "antd";
import { SearchIcon } from "lucide-react";
import { API_SERVER_HOST } from "../../api/reviewApi";

const host = API_SERVER_HOST;

const initState = {
  dtoList: [],
  pageNumList: [],
  pageRequestDTO: null,
  prev: false,
  next: false,
  totalCount: 0,
  prevPage: 0,
  nextPage: 0,
  totalPage: 0,
  current: 0,
};

const NUListComponent = () => {
  const { page, size, refresh, moveToList, moveToRead } = useCustomMove();
  const [serverData, setServerData] = useState(initState);
  const [error, setError] = useState(null);
  const [fetching, setFetching] = useState(false);

  // New states for search
  const [keyword, setKeyword] = useState("");
  const [type, setType] = useState("t"); // Default type; adjust based on your needs

  useEffect(() => {
    setFetching(true);
    getListNU({ page, size, keyword, type })
      .then((data) => {
        if (data && Array.isArray(data.dtoList)) {
          setServerData(data);
        } else {
          setServerData(initState);
        }
        setFetching(false);
      })
      .catch((err) => {
        console.error("API Error:", err);
        setError("Failed to load product data");
        setFetching(false);
      });
  }, [page, size, refresh, keyword, type]);
    
      // Handle search submission
  const handleSearch = () => {
    // Trigger a refresh with new keyword
    setFetching(true);
    getListNU({ page: 1, size, keyword, type })
      .then((data) => {
        if (data && Array.isArray(data.dtoList)) {
          setServerData(data);
        } else {
          setServerData(initState);
        }
        setFetching(false);
      })
      .catch((err) => {
        setFetching(false);
      });
  };

  return (
    <div className="py-12">
      <section className="px-4 max-w-6xl mx-auto">
        <h2 className="mb-12 text-4xl font-bold text-center text-gray-800 tracking-wide uppercase">
          Artisan Treasures
        </h2>

        {/* Search Input */}
        <div className="mt-8 flex justify-center mb-8">
          <div className="flex w-full max-w-2xl bg-white rounded-full shadow-lg overflow-hidden border border-gray-200">
            <Input
              placeholder="Search experiences..."
              className="flex-grow border-0 focus:ring-0 text-lg px-6"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <Button
              className="bg-orange-800 hover:bg-rose-700 text-white font-medium tracking-wide py-6 px-6 rounded-r-full"
              onClick={handleSearch}
            >
              <SearchIcon className="h-5 w-5 mr-2" />
              Explore
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-20">
          {serverData.dtoList && serverData.dtoList.length > 0 ? (
            serverData.dtoList.map((product) => (
              <Card
                key={product.pno}
                onClick={() => moveToRead(product.pno)}
                className="relative w-[320px] h-[430px] rounded-lg overflow-hidden bg-white border border-white border-opacity-40 p-4 bg-opacity-20 backdrop-blur-lg transition-transform duration-300 transform group-hover:scale-105 group-hover:shadow-lg cursor-pointer"
              >
                <div className="relative w-full h-48 mb-3 rounded-lg overflow-hidden">
                  <img
                    src={`${host}/api/products/view/s_${product.uploadFileNames[0]}`}
                    alt={product.pname}
                    className="w-full h-full object-cover opacity-80 transition-opacity duration-300 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-black opacity-40 group-hover:opacity-50 transition-opacity"></div>
                </div>

                <div className="relative z-10 flex flex-col items-center justify-center text-center text-white uppercase tracking-wider">
                  <CardTitle className="text-lg font-semibold mb-1">
                    {product.pname}
                  </CardTitle>
                  <CardDescription className="text-sm font-medium mb-2 opacity-90">
                    ${product.pprice.toLocaleString()}
                  </CardDescription>
                  <Button
                    variant="outline"
                    className="px-6 py-2 mt-4 bg-white bg-opacity-50 text-black font-semibold rounded-lg text-sm transition-all duration-300 hover:bg-opacity-80 hover:shadow-md"
                  >
                    Add to Collection
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <p className="text-center text-gray-500">No products available.</p>
          )}
        </div>
      </section>

      <PageComponent serverData={serverData} movePage={moveToList} />
    </div>
  );
};

export default NUListComponent;
