interface ProductDropdownItemProps {
    product: any;
  }
  
  const ProductDropdownItem: React.FC<ProductDropdownItemProps> = ({ product }) => {
    return (
      <div className="p-2 bg-gray-100 rounded my-1">
        <div className="flex justify-between">
          <span>{product.product_name}</span>
          <span className={product.result === "clean" ? "text-green-500" : "text-red-500"}>
            {product.result}
          </span>
        </div>
        <div className="text-sm text-gray-500">
          {product.date} - {product.time}
        </div>
      </div>
    );
  };
  
  export default ProductDropdownItem;
  