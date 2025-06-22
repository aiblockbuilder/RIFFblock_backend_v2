import { Model, DataTypes, Sequelize } from "sequelize"

interface RiffAttributes {
  id: number
  title: string
  description: string
  audioFile: string
  coverImage: string | null
  audioCid: string
  coverCid: string | null
  duration: number
  genre: string
  mood: string
  instrument: string
  keySignature: string
  timeSignature: string
  isBargainBin: boolean
  price: number
  currency: string
  royaltyPercentage: number
  isStakable: boolean
  stakingRoyaltyShare: number
  maxPool: number | null
  isNft: boolean
  tokenId: string
  contractAddress: string
  unlockSourceFiles: boolean
  unlockRemixRights: boolean
  unlockPrivateMessages: boolean
  unlockBackstageContent: boolean
  creatorId: number
  collectionId: number
  createdAt: Date
  updatedAt: Date
}

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  class Riff extends Model<RiffAttributes> implements RiffAttributes {
    id!: number
    title!: string
    description!: string
    audioFile!: string
    coverImage!: string | null
    audioCid!: string
    coverCid!: string | null
    duration!: number
    genre!: string
    mood!: string
    instrument!: string
    keySignature!: string
    timeSignature!: string
    isBargainBin!: boolean
    price!: number
    currency!: string
    royaltyPercentage!: number
    isStakable!: boolean
    stakingRoyaltyShare!: number
    maxPool!: number | null
    isNft!: boolean
    tokenId!: string
    contractAddress!: string
    unlockSourceFiles!: boolean
    unlockRemixRights!: boolean
    unlockPrivateMessages!: boolean
    unlockBackstageContent!: boolean
    creatorId!: number
    collectionId!: number
    createdAt!: Date
    updatedAt!: Date

    static associate(models: any) {
      // Define associations here
      Riff.belongsTo(models.User, { foreignKey: "creatorId", as: "creator" })
      Riff.belongsTo(models.Collection, { foreignKey: "collectionId", as: "collection" })
      Riff.hasMany(models.Stake, { foreignKey: "riffId", as: "stakes" })
      Riff.hasMany(models.Tip, { foreignKey: "riffId", as: "tips" })
      Riff.hasMany(models.Favorite, { foreignKey: "riffId" })
      Riff.belongsToMany(models.Tag, { through: models.RiffTag, foreignKey: "riffId", as: "tags" })
      Riff.belongsToMany(models.User, { through: models.Favorite, foreignKey: "riffId", as: "favoritedBy" })
    }
  }

  Riff.init(
    {
      id: {
        type: dataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: dataTypes.TEXT,
        allowNull: true,
      },
      audioFile: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      coverImage: {
        type: dataTypes.STRING,
        allowNull: true,
      },
      audioCid: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      coverCid: {
        type: dataTypes.STRING,
        allowNull: true,
      },
      duration: {
        type: dataTypes.FLOAT,
        allowNull: true,
      },
      genre: {
        type: dataTypes.STRING,
        allowNull: true,
      },
      mood: {
        type: dataTypes.STRING,
        allowNull: true,
      },
      instrument: {
        type: dataTypes.STRING,
        allowNull: true,
      },
      keySignature: {
        type: dataTypes.STRING,
        allowNull: true,
      },
      timeSignature: {
        type: dataTypes.STRING,
        allowNull: true,
      },
      isBargainBin: {
        type: dataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      price: {
        type: dataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      currency: {
        type: dataTypes.STRING,
        allowNull: true,
        defaultValue: "RIFF",
      },
      royaltyPercentage: {
        type: dataTypes.INTEGER,
        allowNull: true,
        defaultValue: 10,
      },
      isStakable: {
        type: dataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      stakingRoyaltyShare: {
        type: dataTypes.INTEGER,
        allowNull: true,
        defaultValue: 50,
      },
      maxPool: {
        type: dataTypes.INTEGER,
        allowNull: true,
      },
      isNft: {
        type: dataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      tokenId: {
        type: dataTypes.STRING,
        allowNull: true,
      },
      contractAddress: {
        type: dataTypes.STRING,
        allowNull: true,
      },
      unlockSourceFiles: {
        type: dataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      unlockRemixRights: {
        type: dataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      unlockPrivateMessages: {
        type: dataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      unlockBackstageContent: {
        type: dataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      creatorId: {
        type: dataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      collectionId: {
        type: dataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "collections",
          key: "id",
        },
      },
      createdAt: {
        type: dataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: dataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Riff",
      tableName: "riffs",
      timestamps: true,
    }
  )

  return Riff
}
