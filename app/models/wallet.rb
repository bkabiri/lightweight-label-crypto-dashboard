class Wallet < ApplicationRecord
  belongs_to :user
  validates :address, presence: true
  validates :address, uniqueness: { scope: :user_id }
end
