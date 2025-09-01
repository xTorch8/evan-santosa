interface LeaderboardHistoryItemProps {
    product: any;
  }
  
  const LeaderboardHistoryItem: React.FC<LeaderboardHistoryItemProps> = ({ product }) => {
    return (
      <div className="flex justify-between p-2 border-b">
        <span>{product.product_name}</span>
        <span>{product.date} - {product.time}</span>
        <span>{product.result}</span>
      </div>
    );
  };
  
  export default LeaderboardHistoryItem;
  