import { useState } from "react";
import getCompanyProductsHandler from "../api/dashboard/getCompanyProductsHandler";
import ProductDropdownItem from "./ProductDropdownItem";

interface LeaderboardItemProps {
  companyId: number;
  companyName: string;
  cleanCount: number;
  token: string;
}

const LeaderboardItem: React.FC<LeaderboardItemProps> = ({
  companyId,
  companyName,
  cleanCount,
  token,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);

  const handleClick = async () => {
    if (!isOpen) {
      const result = await getCompanyProductsHandler(companyId, token);
      setProducts(result);
    }
    setIsOpen(!isOpen);
  };

  return (
    <div
      className="border p-4 rounded mb-2 hover:bg-blue-800 cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex justify-between items-center text-white font-bold">
        <span>{companyName}</span>
        <span>{cleanCount}% Clean</span>
      </div>
      {isOpen && (
        <div className="mt-2">
          {products.map((product) => (
            <ProductDropdownItem key={product.product_id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default LeaderboardItem;
