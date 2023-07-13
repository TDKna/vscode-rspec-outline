require 'rails_helper'

RSpec.describe Test, type: :model do
  shared_examples_for '成功時の期待値' do
    it '成功時の期待値1' do
    end
    it '成功時の期待値2' do
    end
  end

  shared_context '一括テスト' do
    context '一括テストの条件' do
      it '一括テストの期待値' do
      end
    end
    context '複数行にまたがる' \
    '見出し' do
    end
  end

  describe '説明1' do
    context '条件1' do
      it '期待値1' do
      end
    end

    context '条件2' do
      it_behaves_like '成功時の期待値'
    end

    include_context '一括テスト'
  end
end
